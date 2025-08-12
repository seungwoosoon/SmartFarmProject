#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
#include "oled_u8g2.h"
#include "config.h"

WiFiClient espClient;
PubSubClient client(espClient);

// CJMCU-2812-12 LED 링 (D6 = GPIO15)
#define LED_PIN 15
#define NUM_LEDS 12
Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

void setWhiteBrightness(uint8_t brightness) {
  for (int i = 0; i < NUM_LEDS; i++) {
    strip.setPixelColor(i, strip.Color(brightness, brightness, brightness));
  }
  strip.show();
}

void callback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<128> doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) return;

  int pwm = doc["pwm"];
  pwm = constrain(pwm, 0, 255);
  setWhiteBrightness(pwm);
  Serial.printf("PWM 수신 → 밝기: %d\n", pwm);
}

void setup() {
  Serial.begin(115200);
  strip.begin();
  strip.setBrightness(255);
  strip.clear();
  strip.show();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi 연결됨");
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  client.connect("ETBoardClient");
  client.subscribe("led/control");  // 밝기 명령 수신용
}

void loop() {
  if (!client.connected()) {
    client.connect("ETBoardClient");
    client.subscribe("led/control");
  }
  client.loop();

  delay(100);  // CPU 부담 줄이기
}
