package com.krishidrishti.inference;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.tensorflow.lite.Interpreter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class InferenceService implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(InferenceService.class);
    private static final int SIZE = 224;
    private static final int BACKGROUND_INDEX = 4;
    private static final float THRESHOLD = 0.25f;
    private final Path modelPath;
    private final Interpreter interpreter;

    public InferenceService(@Value("${krishi.model-path}") String configuredPath) {
        modelPath = Path.of(configuredPath).toAbsolutePath();
        try {
            if (!Files.isRegularFile(modelPath)) {
                throw new IllegalStateException("Model file was not found at " + modelPath);
            }
            ByteBuffer modelBuffer = ByteBuffer.allocateDirect((int) Files.size(modelPath))
                    .order(ByteOrder.nativeOrder());
            modelBuffer.put(Files.readAllBytes(modelPath));
            modelBuffer.rewind();
            interpreter = new Interpreter(modelBuffer);
            int[] inputShape = interpreter.getInputTensor(0).shape();
            int[] outputShape = interpreter.getOutputTensor(0).shape();
            if (inputShape.length != 4 || inputShape[1] != 3 || inputShape[2] != SIZE || inputShape[3] != SIZE) {
                throw new IllegalStateException("Unsupported model input shape.");
            }
            if (outputShape.length != 2 || outputShape[1] != ClassMapping.CLASSES.length) {
                throw new IllegalStateException("Unsupported model output shape.");
            }
            log.info("Loaded TFLite model {} with input shape {} and output shape {}",
                    modelPath, java.util.Arrays.toString(inputShape), java.util.Arrays.toString(outputShape));
        } catch (IOException | RuntimeException exception) {
            throw new IllegalStateException("Could not initialize the plant disease model.", exception);
        }
    }

    public boolean isReady() {
        return Files.isRegularFile(modelPath) && interpreter.getInputTensorCount() == 1
                && interpreter.getOutputTensorCount() == 1;
    }

    public List<Prediction> predict(MultipartFile upload) throws IOException {
        if (upload == null || upload.isEmpty()) throw new IllegalArgumentException("Image must be non-empty.");
        if (upload.getSize() > 20_000_000) throw new IllegalArgumentException("Image must be no larger than 20 MB.");
        String contentType = upload.getContentType();
        if (contentType != null && !List.of("image/png", "image/jpeg").contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only PNG and JPG images are supported.");
        }
        BufferedImage source = ImageIO.read(upload.getInputStream());
        if (source == null) throw new IllegalArgumentException("The uploaded file is not a supported image.");
        BufferedImage image = centerCrop(source);
        FloatBuffer input = FloatBuffer.allocate(3 * SIZE * SIZE);
        for (int channel = 0; channel < 3; channel++) {
            for (int y = 0; y < SIZE; y++) {
                for (int x = 0; x < SIZE; x++) {
                    Color color = new Color(image.getRGB(x, y));
                    int value = channel == 0 ? color.getRed() : channel == 1 ? color.getGreen() : color.getBlue();
                    float mean = channel == 0 ? 0.485f : channel == 1 ? 0.456f : 0.406f;
                    float standardDeviation = channel == 0 ? 0.229f : channel == 1 ? 0.224f : 0.225f;
                    input.put(normalize(value, mean, standardDeviation));
                }
            }
        }
        input.rewind();
        float[][] output = new float[1][ClassMapping.CLASSES.length];
        interpreter.run(input, output);
        List<Prediction> predictions = new ArrayList<>();
        for (int i = 0; i < output[0].length; i++) {
            if (i != BACKGROUND_INDEX && output[0][i] >= THRESHOLD) {
                predictions.add(new Prediction(i, ClassMapping.CLASSES[i].crop(), ClassMapping.CLASSES[i].disease(), output[0][i]));
            }
        }
        predictions.sort(Comparator.comparingDouble(Prediction::confidence).reversed());
        if (predictions.isEmpty() || argmax(output[0]) == BACKGROUND_INDEX) {
            throw new IllegalArgumentException("The scan appears to be outside the supported leaf classes.");
        }
        return predictions.subList(0, Math.min(3, predictions.size()));
    }

    private static BufferedImage centerCrop(BufferedImage source) {
        BufferedImage image = new BufferedImage(SIZE, SIZE, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        double scale = Math.max((double) SIZE / source.getWidth(), (double) SIZE / source.getHeight());
        int width = (int) Math.ceil(source.getWidth() * scale);
        int height = (int) Math.ceil(source.getHeight() * scale);
        graphics.drawImage(source, (SIZE - width) / 2, (SIZE - height) / 2, width, height, null);
        graphics.dispose();
        return image;
    }

    private static float normalize(int channel, float mean, float standardDeviation) {
        return (channel / 255f - mean) / standardDeviation;
    }

    private static int argmax(float[] values) {
        int index = 0;
        for (int i = 1; i < values.length; i++) if (values[i] > values[index]) index = i;
        return index;
    }

    @Override
    public void close() {
        interpreter.close();
    }

    public record Prediction(int index, String crop, String disease, double confidence) {}
}
