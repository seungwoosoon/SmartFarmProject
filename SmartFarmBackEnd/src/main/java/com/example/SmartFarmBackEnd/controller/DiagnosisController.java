package com.example.SmartFarmBackEnd.controller;

import com.example.SmartFarmBackEnd.service.DiagnosisService;
import com.example.SmartFarmBackEnd.dto.DiagnosisRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    @PostMapping("/diagnosis")
    public ResponseEntity<String> receiveDiagnosis(@RequestBody DiagnosisRequest request) {

        // 로그 출력
        System.out.println("====== AI 진단 결과 수신 ======");
        System.out.println("디바이스 ID: " + request.getDeviceId());
        System.out.println("진단 시간: " + request.getTimestamp());
        System.out.println("진단명: " + request.getDetection().getClassName());
        System.out.println("신뢰도: " + request.getDetection().getConfidence());
        System.out.println("================================");

        // Pot 상태 반영 (className만 전달)
        diagnosisService.applyDiagnosis(request.getDetection().getClassName());

        return ResponseEntity.ok("Diagnosis received and applied successfully.");
    }
}