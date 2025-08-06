//package com.example.SmartFarmBackEnd.service;
//
//import lombok.RequiredArgsConstructor;
//import org.eclipse.paho.client.mqttv3.MqttClient;
//import org.eclipse.paho.client.mqttv3.MqttMessage;
//import org.springframework.stereotype.Service;
//
//import java.util.concurrent.atomic.AtomicReference;
//import java.util.regex.Matcher;
//import java.util.regex.Pattern;
//
//@Service
//@RequiredArgsConstructor
//public class SensorService {
//
//    // MQTT 클라이언트는 Config에서 빈으로 만들어져 주입됩니다.
//    private final MqttClient mqttClient;
//
//    // 최신 메시지를 안전하게 저장하기 위해 AtomicReference 사용
//    private final AtomicReference<String> latestMessage = new AtomicReference<>();
//
//    public void processSensorMessage(String message) {
//        // 최신 메시지 저장
//        latestMessage.set(message);
//
//        // "L:123" 형식에서 숫자만 뽑아 PWM 계산
//        Pattern pattern = Pattern.compile("L[:= ]?(\\d+)");
//        Matcher matcher = pattern.matcher(message);
//        if (matcher.find()) {
//            int light = Integer.parseInt(matcher.group(1));
//            int pwm = calculatePwm(light);
//            publishPwm(pwm);
//        }
//    }
//
//    private int calculatePwm(int light) {
//        if (light > 1000) return 0;
//        if (light < 200)  return 255;
//        return (int)(255 * (1 - (light - 200) / 800.0));
//    }
//
//    private void publishPwm(int pwm) {
//        try {
//            String payload = "{\"pwm\":" + pwm + "}";
//            MqttMessage msg = new MqttMessage(payload.getBytes());
//            msg.setQos(1);  // 원하는 QoS 설정
//            mqttClient.publish("led/control", msg);
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
//
//    public String getLatestMessage() {
//        return latestMessage.get();
//    }
//}