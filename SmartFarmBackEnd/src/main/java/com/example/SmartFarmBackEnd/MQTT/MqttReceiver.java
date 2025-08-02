package com.example.SmartFarmBackEnd.MQTT;

import com.example.SmartFarmBackEnd.service.SensorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MqttReceiver {

    private final MqttClient mqttClient;      // Config에서 만든 빈 주입
    private final SensorService sensorService;

    @PostConstruct
    public void init() {
        try {
            // 이미 connect 된 클라이언트 사용
            mqttClient.subscribe("etboard/sensor", (topic, msg) -> {
                String payload = new String(msg.getPayload());
                sensorService.processSensorMessage(payload);
            });
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }
}