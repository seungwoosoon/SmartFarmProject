package com.example.SmartFarmBackEnd.MQTT;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MqttPublisher {
    private final MqttClient mqttClient;

    public void publish(String topic, String payload) {
        if (!mqttClient.isConnected()) {
            log.warn("⚠️ MQTT 미연결, 발행 스킵: topic={}, payload={}", topic, payload);
            return;
        }
        try {
            mqttClient.publish(topic, new MqttMessage(payload.getBytes()));
            log.info("📤 MQTT 발행: topic={}, payload={}", topic, payload);
        } catch (MqttException e) {
            log.error("❌ MQTT 발행 실패: {}", e.getMessage());
        }
    }
}
