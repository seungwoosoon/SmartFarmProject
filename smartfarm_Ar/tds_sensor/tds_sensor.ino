// #define TdsSensorPin 33     // A3 (GPIO33)
// #define VREF 3.3
// #define SCOUNT 30

// int analogBuffer[SCOUNT];
// int analogBufferTemp[SCOUNT];
// int analogBufferIndex = 0;
// float averageVoltage = 0;
// float tdsValue = 0;
// float temperature = 25;

// void setup() {
//   Serial.begin(115200);
// }

// void loop() {
//   static unsigned long analogSampleTimepoint = millis(); 
//   if (millis() - analogSampleTimepoint > 40U) {
//     analogSampleTimepoint = millis();
//     analogBuffer[analogBufferIndex] = analogRead(TdsSensorPin);
//     analogBufferIndex++;
//     if (analogBufferIndex == SCOUNT)
//       analogBufferIndex = 0;
//   }

//   static unsigned long printTimepoint = millis();
//   if (millis() - printTimepoint > 800U) {
//     printTimepoint = millis();

//     for (int i = 0; i < SCOUNT; i++)
//       analogBufferTemp[i] = analogBuffer[i];

//     averageVoltage = getMedianNum(analogBufferTemp, SCOUNT) * VREF / 4095.0;

//     float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0);
//     float compensationVoltage = averageVoltage / compensationCoefficient;

//     tdsValue = (133.42 * pow(compensationVoltage, 3)
//                - 255.86 * pow(compensationVoltage, 2)
//                + 857.39 * compensationVoltage) * 0.5;

//     Serial.print("TDS Value: ");
//     Serial.print(tdsValue, 0);
//     Serial.println(" ppm");
//   }
// }

// int getMedianNum(int bArray[], int iFilterLen) {
//   int bTab[iFilterLen];
//   for (byte i = 0; i < iFilterLen; i++)
//     bTab[i] = bArray[i];

//   for (int j = 0; j < iFilterLen - 1; j++) {
//     for (int i = 0; i < iFilterLen - j - 1; i++) {
//       if (bTab[i] > bTab[i + 1]) {
//         int temp = bTab[i];
//         bTab[i] = bTab[i + 1];
//         bTab[i + 1] = temp;
//       }
//     }
//   }

//   if ((iFilterLen & 1) > 0)
//     return bTab[(iFilterLen - 1) / 2];
//   else
//     return (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
// }

#include <WiFi.h>
#include <PubSubClient.h>
#include "config.h"

// Wi-Fi 설정

// MQTT 설정
const int mqtt_port = 1883;
const char* mqtt_topic = "sensor/data";

// TDS 센서 설정
#define TdsSensorPin 33
#define VREF 3.3
#define SCOUNT 30

int analogBuffer[SCOUNT];
int analogBufferTemp[SCOUNT];
int analogBufferIndex = 0;
float averageVoltage = 0;
float tdsValue = 0;
float temperature = 25;

WiFiClient espClient;
PubSubClient client(espClient);

// 중위값 필터
int getMedianNum(int bArray[], int iFilterLen) {
  int bTab[iFilterLen];
  for (byte i = 0; i < iFilterLen; i++)
    bTab[i] = bArray[i];

  for (int j = 0; j < iFilterLen - 1; j++) {
    for (int i = 0; i < iFilterLen - j - 1; i++) {
      if (bTab[i] > bTab[i + 1]) {
        int temp = bTab[i];
        bTab[i] = bTab[i + 1];
        bTab[i + 1] = temp;
      }
    }
  }
  if ((iFilterLen & 1) > 0)
    return bTab[(iFilterLen - 1) / 2];
  else
    return (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
}

// Wi-Fi 연결
void setup_wifi() {
  delay(10);
  Serial.println("Wi-Fi 연결 중...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi 연결 완료");
}

// MQTT 연결
void reconnect() {
  while (!client.connected()) {
    Serial.print("MQTT 연결 중...");
    if (client.connect("ESP32Client")) {
      Serial.println("MQTT 연결 성공");
    } else {
      Serial.print("실패, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  static unsigned long analogSampleTimepoint = millis();
  if (millis() - analogSampleTimepoint > 40U) {
    analogSampleTimepoint = millis();
    analogBuffer[analogBufferIndex] = analogRead(TdsSensorPin);
    analogBufferIndex++;
    if (analogBufferIndex == SCOUNT) analogBufferIndex = 0;
  }

  static unsigned long printTimepoint = millis();
  if (millis() - printTimepoint > 800U) {
    printTimepoint = millis();
    for (int i = 0; i < SCOUNT; i++)
      analogBufferTemp[i] = analogBuffer[i];

    averageVoltage = getMedianNum(analogBufferTemp, SCOUNT) * VREF / 4095.0;
    float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0);
    float compensationVoltage = averageVoltage / compensationCoefficient;

    tdsValue = (133.42 * pow(compensationVoltage, 3)
               - 255.86 * pow(compensationVoltage, 2)
               + 857.39 * compensationVoltage) * 0.5;

    Serial.print("TDS Value: ");
    Serial.print(tdsValue, 0);
    Serial.println(" ppm");

    // --- MQTT 메시지로 전송할 JSON 생성 ---
    String payload = "{\"sensor\":\"tds\", \"value\":" + String(tdsValue, 2) + "}";

    // --- MQTT로 전송 ---
    client.publish(mqtt_topic, payload.c_str());
  }
}

