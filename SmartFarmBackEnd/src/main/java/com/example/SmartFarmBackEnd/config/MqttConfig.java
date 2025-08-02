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
        MqttClient client = null;
        try {
            client = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
            MqttConnectOptions opts = new MqttConnectOptions();
            opts.setCleanSession(true);
            opts.setAutomaticReconnect(true);
            try {
                client.connect(opts);
            } catch (MqttException e) {
                log.warn("Failed to connect to MQTT broker {}: {}", brokerUrl, e.getMessage());
            }
        } catch (MqttException e) {
            log.warn("Failed to create MQTT client for broker {}: {}", brokerUrl, e.getMessage());
        }
        return client;
    }
}