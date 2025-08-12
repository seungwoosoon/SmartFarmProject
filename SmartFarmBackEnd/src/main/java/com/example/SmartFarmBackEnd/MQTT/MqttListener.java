package com.example.SmartFarmBackEnd.MQTT;

import com.example.SmartFarmBackEnd.service.SensorService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MqttListener implements ApplicationRunner {

    private final MqttClient mqttClient;
    private final SensorService sensorService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${mqtt.topic-sub}")
    private String subTopic; // etboard/# 권장

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("🚀 MQTT 구독 준비: {}", subTopic);

        mqttClient.setCallback(new MqttCallbackExtended() {
            @Override
            public void connectComplete(boolean reconnect, String serverURI) {
                try {
                    mqttClient.subscribe(subTopic, 1);
                    log.info("📡 MQTT 구독 {}: {}", (reconnect ? "재시작" : "시작"), subTopic);
                } catch (MqttException e) {
                    log.error("❌ 구독 실패: {}", e.getMessage());
                }
            }
            @Override public void connectionLost(Throwable cause) {
                log.warn("⚠️ MQTT 끊김: {}", cause == null ? "unknown" : cause.getMessage());
            }
            @Override public void deliveryComplete(IMqttDeliveryToken token) { }

            @Override
            public void messageArrived(String topic, MqttMessage message) {
                String payload = new String(message.getPayload());
                log.info("📥 RAW: topic={}, payload={}", topic, payload);

                try { sensorService.processSensorMessage(payload); }
                catch (Exception e) { log.warn("⚠️ SensorService 처리 오류: {}", e.getMessage()); }
            }
        });

        // 최초 1회 구독(재연결 시엔 connectComplete에서 자동)
        mqttClient.subscribe(subTopic, 1);
        log.info("✅ MQTT 구독 시작: {}", subTopic);
    }
}