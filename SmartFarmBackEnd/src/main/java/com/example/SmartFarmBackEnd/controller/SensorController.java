package com.example.SmartFarmBackEnd.controller;

import com.example.SmartFarmBackEnd.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensorService;

    @GetMapping("/sensor/latest")
    public ResponseEntity<String> getLatestSensorData() {
        return ResponseEntity.ok(sensorService.getLatestMessage());
    }
}