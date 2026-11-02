package com.krishidrishti.inference;

import ai.onnxruntime.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.FloatBuffer;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class InferenceService implements AutoCloseable {
    private static final int SIZE = 224;
    private static final int BACKGROUND_INDEX = 4;
    private static final float THRESHOLD = 0.25f;
    private final OrtEnvironment environment = OrtEnvironment.getEnvironment();
    private final OrtSession session;

    public InferenceService(@Value("${krishi.model-path}") String modelPath) throws OrtException {
        session = environment.createSession(Path.of(modelPath).toAbsolutePath().toString(), new OrtSession.SessionOptions());
    }

    public List<Prediction> predict(MultipartFile upload) throws IOException, OrtException {
        if (upload.isEmpty() || upload.getSize() > 10_000_000) throw new IllegalArgumentException("Image must be non-empty and no larger than 10 MB.");
        BufferedImage source = ImageIO.read(upload.getInputStream());
        if (source == null) throw new IllegalArgumentException("The uploaded file is not a supported image.");
        BufferedImage image = new BufferedImage(SIZE, SIZE, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        graphics.drawImage(source, 0, 0, SIZE, SIZE, null);
        graphics.dispose();
        float[] input = new float[3 * SIZE * SIZE];
        for (int y = 0; y < SIZE; y++) for (int x = 0; x < SIZE; x++) {
            Color color = new Color(image.getRGB(x, y));
            int offset = y * SIZE + x;
            input[offset] = normalize(color.getRed(), 0.485f, 0.229f);
            input[SIZE * SIZE + offset] = normalize(color.getGreen(), 0.456f, 0.224f);
            input[2 * SIZE * SIZE + offset] = normalize(color.getBlue(), 0.406f, 0.225f);
        }
        String inputName = session.getInputNames().iterator().next();
        try (OnnxTensor tensor = OnnxTensor.createTensor(environment, FloatBuffer.wrap(input), new long[]{1, 3, SIZE, SIZE});
             OrtSession.Result result = session.run(Map.of(inputName, tensor))) {
            Object value = result.get(0).getValue();
            float[] logits = flatten(value);
            float maxLogit = logits[0];
            for (int i = 1; i < logits.length; i++) {
                if (logits[i] > maxLogit) maxLogit = logits[i];
            }
            double max = maxLogit;
            double sum = 0;
            double[] probabilities = new double[logits.length];
            for (int i = 0; i < logits.length; i++) { probabilities[i] = Math.exp(logits[i] - max); sum += probabilities[i]; }
            List<Prediction> predictions = new ArrayList<>();
            for (int i = 0; i < probabilities.length; i++) if (i < ClassMapping.CLASSES.length && i != BACKGROUND_INDEX && probabilities[i] / sum >= THRESHOLD)
                predictions.add(new Prediction(i, ClassMapping.CLASSES[i].crop(), ClassMapping.CLASSES[i].disease(), probabilities[i] / sum));
            predictions.sort(Comparator.comparingDouble(Prediction::confidence).reversed());
            if (predictions.isEmpty() || (int) argmax(probabilities) == BACKGROUND_INDEX) throw new IllegalArgumentException("The scan appears to be outside the supported leaf classes.");
            return predictions.subList(0, Math.min(3, predictions.size()));
        }
    }

    private static float normalize(int channel, float mean, float std) { return (channel / 255f - mean) / std; }
    private static int argmax(double[] values) { int index = 0; for (int i = 1; i < values.length; i++) if (values[i] > values[index]) index = i; return index; }
    private static float[] flatten(Object value) { if (value instanceof float[][] matrix) return matrix[0]; if (value instanceof float[] vector) return vector; throw new IllegalStateException("Unsupported model output tensor."); }
    @Override public void close() throws OrtException { session.close(); }
    public record Prediction(int index, String crop, String disease, double confidence) {}
}
