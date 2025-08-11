package com.example.SmartFarmBackEnd.controller;

import com.example.SmartFarmBackEnd.dto.DiagnosisRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DiagnosisController {

    @PostMapping("/diagnosis")
    public ResponseEntity<String> receiveDiagnosis(@RequestBody DiagnosisRequest request) {

        // 파이썬 스크립트가 보낸 데이터를 성공적으로 받았는지 확인
        System.out.println("====== AI 진단 결과 수신 ======");
        System.out.println("디바이스 ID: " + request.getDeviceId());
        System.out.println("진단 시간: " + request.getTimestamp());
        System.out.println("진단명: " + request.getDetection().getClassName());
        System.out.println("신뢰도: " + request.getDetection().getConfidence());
        System.out.println("================================");

        // 여기서 받은 데이터를 DB에 저장하거나, 다른 로직을 처리하면 됩니다.

        // 클라이언트(파이썬)에게 성공적으로 받았다고 응답 보내기
        return ResponseEntity.ok("Diagnosis received successfully.");
    }
}
