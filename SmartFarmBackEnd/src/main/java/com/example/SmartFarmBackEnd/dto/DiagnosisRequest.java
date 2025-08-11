package com.example.SmartFarmBackEnd.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class DiagnosisRequest {

    private String deviceId;
    private OffsetDateTime timestamp; // ISO 8601 형식을 받기 위해 OffsetDateTime 사용
    private DetectionInfo detection;

    @Data
    public static class DetectionInfo {
        private String className;
        private double confidence;
    }
}