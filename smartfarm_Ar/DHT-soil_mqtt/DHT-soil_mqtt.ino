#include <WiFi.h>
#include <PubSubClient.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <ArduinoJson.h>  // JSON 추가
#include "config.h"

// MQTT 토픽
const char* topic_pub = "etboard/sensor/data";
const char* topic_sub = "etboard/sensor/cmd";
const char* topic_led = "led/control";

WiFiClient espClient;
PubSubClient client(espClient);

#define DHTPIN 17
#define DHTTYPE DHT11
#define SOIL_PIN 16
#define CDS_PIN 39

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
String latestMessage = "";

void setup_wifi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());
}

void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  latestMessage = String((char*)payload);
  Serial.println("MQTT Received: " + latestMessage);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("MQTT CMD:");
  lcd.setCursor(0, 1);
  lcd.print(latestMessage);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT...");
    if (client.connect("ESP32Client_LCD")) {
      Serial.println(" connected");
      client.subscribe(topic_sub);
    } else {
      Serial.print(" failed, rc=");
      Serial.print(client.state());
      Serial.println(", retrying...");
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  Wire.begin(21, 22);         // ✅ I2C 핀 설정 (SDA=21, SCL=22)
  lcd.begin(16, 2);
  lcd.backlight();
  lcd.print("Sensor Ready");

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float temp = dht.readTemperature();
  float humi = dht.readHumidity();
  int soil = analogRead(SOIL_PIN);
  int cds = analogRead(CDS_PIN);

  if (isnan(temp) || isnan(humi)) {
    Serial.println("DHT11 read error!");
    return;
  }

  Serial.printf("T:%.1f H:%.0f S:%d L:%d\n", temp, humi, soil, cds);

  // 센서 문자열 MQTT로 전송
  String payload = "T:" + String(temp, 1) + "C H:" + String(humi, 0) +
                   "% S:" + String(soil) + " L:" + String(cds);
  client.publish(topic_pub, payload.c_str());

  // LED 제어용 PWM 값 JSON 전송
  int pwm = map(cds, 0, 4095, 255, 0);  // 밝을수록 어둡게
  StaticJsonDocument<64> doc;
  doc["pwm"] = constrain(pwm, 0, 255);
  char jsonBuffer[64];
  serializeJson(doc, jsonBuffer);
  client.publish(topic_led, jsonBuffer);

  Serial.printf("LED PWM → %d\n", pwm);

  // ✅ LCD에 실시간 센서 출력
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:"); lcd.print(temp, 1); lcd.print("C ");
  lcd.print("H:"); lcd.print(humi, 0); lcd.print("%");

  lcd.setCursor(0, 1);
  lcd.print("S:"); lcd.print(soil);
  lcd.print(" L:"); lcd.print(cds);

  delay(5000);  // 5초마다 갱신
}

