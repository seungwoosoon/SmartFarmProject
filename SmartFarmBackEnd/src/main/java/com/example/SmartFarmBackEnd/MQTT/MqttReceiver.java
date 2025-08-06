package com.example.SmartFarmBackEnd.MQTT;

import com.example.SmartFarmBackEnd.service.SensorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.stereotype.Component;

//@Component
//@RequiredArgsConstructor
//public class MqttReceiver {
//
//    private final MqttClient mqttClient;      // Config에서 만든 빈 주입
//    private final SensorService sensorService;
//
//    @PostConstruct
//    public void init() {
//        try {
//            if (!mqttClient.isConnected()) {
//                System.err.println("❌ MQTT 브로커에 연결되어 있지 않습니다. 연결을 생략합니다.");
//                return;  // 연결 안 돼도 서비스는 계속 동작하게
//            }
//
//            mqttClient.subscribe("etboard/sensor", (topic, msg) -> {
//                String payload = new String(msg.getPayload());
//                sensorService.processSensorMessage(payload);
//            });
//
//            System.out.println("✅ MQTT 구독 성공");
//        } catch (MqttException e) {
//            System.err.println("⚠️ MQTT 구독 실패: " + e.getMessage());
//            // 예외 발생해도 죽지 않도록 로그만 남기고 앱 실행 계속
//        }
//    }
//}