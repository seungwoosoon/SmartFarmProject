package com.example.SmartFarmBackEnd.config;

import com.example.SmartFarmBackEnd.service.SensorService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
@Slf4j
public class MqttConfig {

    @Value("${mqtt.broker}")
    private String brokerUrl;

    @Value("${mqtt.client-id}")
    private String clientId;

    @Bean
    public MqttClient mqttClient() {
        try {
            String realClientId = clientId + "-" + java.util.UUID.randomUUID(); // 충돌 방지
            MqttClient client = new MqttClient(brokerUrl, realClientId, new MemoryPersistence());

            MqttConnectOptions opts = new MqttConnectOptions();
            opts.setAutomaticReconnect(true);
            opts.setCleanSession(true);
            opts.setKeepAliveInterval(30);

            client.connect(opts);
            log.info("🔗 MQTT connected: broker={}, clientId={}", brokerUrl, realClientId);
            return client;
        } catch (MqttException e) {
            throw new RuntimeException("MQTT 초기화 실패", e);
        }
    }
}