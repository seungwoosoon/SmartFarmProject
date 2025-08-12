package com.example.SmartFarmBackEnd.dto;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class DiagnosisRequest {
    private String deviceId;
    private String timestamp; // 또는 Instant/OffsetDateTime로 받고 @JsonFormat 지정
    private Detection detection;

    @Getter @Setter @NoArgsConstructor
    public static class Detection {
        private String className;
        private Double confidence;
    }
}