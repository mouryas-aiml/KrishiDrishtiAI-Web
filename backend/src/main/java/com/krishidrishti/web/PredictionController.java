package com.krishidrishti.web;

import com.krishidrishti.inference.InferenceService;
import com.krishidrishti.model.Scan;
import com.krishidrishti.model.ScanRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PredictionController {
    private final InferenceService inference;
    private final ScanRepository scans;
    public PredictionController(InferenceService inference, ScanRepository scans) { this.inference = inference; this.scans = scans; }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "krishi-drishti-api");
    }

    @PostMapping(value = "/predictions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PredictionResponse predict(@RequestPart("image") MultipartFile image) throws Exception {
        List<InferenceService.Prediction> predictions = inference.predict(image);
        if (!predictions.isEmpty()) { var top = predictions.get(0); scans.save(new Scan(top.crop(), top.disease(), top.confidence())); }
        return new PredictionResponse(predictions);
    }

    @GetMapping("/scans")
    public List<Scan> history() { return scans.findAll(); }
    public record PredictionResponse(List<InferenceService.Prediction> predictions) {}
}
