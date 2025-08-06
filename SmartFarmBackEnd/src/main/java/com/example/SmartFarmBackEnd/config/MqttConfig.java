package com.example.SmartFarmBackEnd.config;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class MqttConfig {
    // yaml: mqtt.broker
    @Value("${mqtt.broker}")
    private String brokerUrl;

    // yaml: mqtt.client-id
    @Value("${mqtt.client-id}")
    private String clientId;

    @Bean
    public MqttClient mqttClient() {
        try {
            MqttClient client = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
            MqttConnectOptions opts = new MqttConnectOptions();
            opts.setCleanSession(true);
            opts.setAutomaticReconnect(true);
            client.connect(opts);
            log.info("✅ MQTT 연결 성공: {}", brokerUrl);
            return client;
        } catch (MqttException e) {
            log.warn("⚠️ MQTT 연결 실패: {} → 더미 클라이언트 반환", e.getMessage());
            // 더미 MqttClient라도 생성해서 반환 (연결은 안 되더라도 NPE 방지)
            try {
                return new MqttClient("tcp://localhost:1884", clientId + "-dummy", new MemoryPersistence());
            } catch (MqttException ex) {
                throw new RuntimeException("MQTT 클라이언트 생성 자체가 불가능합니다.", ex);
            }
        }
    }
}