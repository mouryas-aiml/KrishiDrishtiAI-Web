package com.krishidrishti.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "scans")
public class Scan {
    @Id
    private UUID id = UUID.randomUUID();
    private String crop;
    private String disease;
    private double confidence;
    private Instant createdAt = Instant.now();

    protected Scan() {}
    public Scan(String crop, String disease, double confidence) {
        this.crop = crop;
        this.disease = disease;
        this.confidence = confidence;
    }
    public UUID getId() { return id; }
    public String getCrop() { return crop; }
    public String getDisease() { return disease; }
    public double getConfidence() { return confidence; }
    public Instant getCreatedAt() { return createdAt; }
}
