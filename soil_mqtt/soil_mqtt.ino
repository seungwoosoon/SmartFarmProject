#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <secrets.h>
#include "config.h"


const int SOIL_PIN = 4;

WiFiClient espClient;
PubSubClient client(espClient);

// 👉 MQTT 수신 콜백 함수 추가
void callback(char* topic, byte* payload, unsigned int length) {
  char buffer[length + 1];
  memcpy(buffer, payload, length);
  buffer[length] = '\0';

  String msg = String(buffer);
  Serial.print("📥 받은 토픽: ");
  Serial.println(topic);
  Serial.print("📦 내용: ");
  Serial.println(msg);
}

void setup_wifi() {
  delay(100);
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\n✅ Wi-Fi connected! IP:");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32Client_Soil")) {
      Serial.println("✅ connected!");
      // 🔥 친구의 센서 데이터 구독
      client.subscribe("etboard/temp");
      client.subscribe("etboard/humi");
    } else {
      Serial.print("❌ failed, rc=");
      Serial.print(client.state());
      Serial.println(" → retry in 2s");
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);  // ✅ 수신 콜백 등록
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  int soilValue = analogRead(SOIL_PIN);
  Serial.print("Soil moisture value: ");
  Serial.println(soilValue);

  String status;
  if (soilValue < 1500) status = "dry";
  else if (soilValue < 3000) status = "moist";
  else status = "wet";

  StaticJsonDocument<100> doc;
  doc["value"] = soilValue;
  doc["status"] = status;

  char payload[128];
  serializeJson(doc, payload);
  client.publish("etboard/soil", payload);

  delay(5000);
}
