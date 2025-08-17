#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_NeoPixel.h>
#include <math.h>
#include "config.h"  

// ====== Pins ======
#define DHTPIN 4
#define DHTTYPE DHT11
#define PH_PIN 35
#define TDS_PIN 33
#define SOIL_PIN 34
#define CDS_PIN 39
#define LED_PIN 15
#define NUM_LEDS 12

// ====== Globals ======
WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);
Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);

float temp=0, humi=0, soil=0, cds=0, tds=0, ph=0;
uint8_t currentPwm = 120; // 현재 네오픽셀 밝기(0~255)

// --- TDS ---
#define VREF 3.3
#define SCOUNT 30
int analogBuffer[SCOUNT];
int analogBufferTemp[SCOUNT];
int analogBufferIndex = 0;

// --- 조도 → LED 자동 제어 ---
const bool INVERT_BRIGHTNESS = true; // true: 밝을수록 LED 어둡게
const float EMA_ALPHA = 0.12f;       // EMA 필터 계수
const float GAMMA = 2.2f;            // 감마 보정
const uint8_t MIN_PWM = 10;          // 하한(완전 꺼짐 방지)
const uint8_t MAX_PWM = 255;
int cdsMin = 0, cdsMax = 0;
float cdsEma = 0;
bool autoMode = true;                // 기본 자동 모드
uint8_t manualPwm = 120;
unsigned long adaptUntil = 0;
const unsigned long ADAPT_MS = 8000; // 초기 환경 학습 시간

// ── 토양수분 보정(마르면 0%, 젖으면 100%)
#define SOIL_DRY_RAW 3200
#define SOIL_WET_RAW 1200

int readSoilRawAvg(uint8_t n = 10) {
  long acc = 0;
  for (uint8_t i=0;i<n;i++) {
    acc += analogRead(SOIL_PIN);
    delay(2);
  }
  return (int)(acc / n);
}

float soilPercentFromRaw(int raw) {
  int dry = SOIL_DRY_RAW, wet = SOIL_WET_RAW;
  if (dry == wet) return 0;
  if (dry < wet) { int t=dry; dry=wet; wet=t; }
  if (raw > dry) raw = dry;
  if (raw < wet) raw = wet;
  float pct = (float)(dry - raw) * 100.0f / (float)(dry - wet);
  return constrain(pct, 0, 100);
}

// ── 네오픽셀 밝기 적용
void setWhiteBrightness(uint8_t brightness) {
  for (int i = 0; i < NUM_LEDS; i++)
    strip.setPixelColor(i, strip.Color(brightness, brightness, brightness));
  strip.show();
  currentPwm = brightness;
}

// ── 보조 함수들(TDS)
int getMedianNum(int bArray[], int len) {
  for (int i=0;i<len-1;i++)
    for (int j=0;j<len-i-1;j++)
      if (bArray[j] > bArray[j+1]) {
        int t=bArray[j];
        bArray[j]=bArray[j+1];
        bArray[j+1]=t;
      }
  return len%2 ? bArray[len/2] : (bArray[len/2]+bArray[len/2-1])/2;
}

float getTDS(float tempC) {
  for (int i=0;i<SCOUNT;i++) analogBufferTemp[i]=analogBuffer[i];
  int median = getMedianNum(analogBufferTemp, SCOUNT);
  float voltage = median * VREF / 4095.0;
  float compensation = 1.0 + 0.02 * (tempC - 25.0);
  float compVolt = voltage / compensation;
  return (133.42*pow(compVolt,3) - 255.86*pow(compVolt,2) + 857.39*compVolt) * 0.5;
}

// ── 조도 RAW → PWM
uint8_t cdsToPwm(int cdsRaw) {
  if (millis() < adaptUntil) {
    cdsMin = min(cdsMin, cdsRaw);
    cdsMax = max(cdsMax, cdsRaw);
  }
  int span = max(100, cdsMax - cdsMin);
  cdsEma = (cdsEma == 0 ? cdsRaw : EMA_ALPHA * cdsRaw + (1.0f - EMA_ALPHA) * cdsEma);
  float norm = (cdsEma - cdsMin) / (float)span;
  norm = constrain(norm, 0.0f, 1.0f);
  float level = INVERT_BRIGHTNESS ? (1.0f - norm) : norm;
  float gammaLevel = pow(level, 1.0f / GAMMA);
  int pwm = (int)round(gammaLevel * MAX_PWM);
  return (uint8_t)constrain(pwm, MIN_PWM, MAX_PWM);
}

// ── Wi-Fi / MQTT
void setup_wifi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<256> doc;
  auto err = deserializeJson(doc, payload, length);
  if (!err) {
    if (doc.containsKey("mode")) {
      const char* m = doc["mode"];
      if (m && strcasecmp(m,"auto")==0) autoMode = true;
      if (m && strcasecmp(m,"manual")==0){ autoMode = false; }
    }
    if (doc.containsKey("pwm")) {
      manualPwm = (uint8_t)constrain((int)doc["pwm"], 0, 255);
      if (!autoMode) setWhiteBrightness(manualPwm);
    }
  }
}

void ensureMqtt() {
  while (!client.connected()) {
    char cid[32];
    snprintf(cid, sizeof(cid), "SmartFarm-%08X", (uint32_t)ESP.getEfuseMac()); // ✅ 고유 ID
    if (client.connect(cid)) {
      client.subscribe("led/control"); // 제어만 받음
    } else {
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  // ADC
  analogSetWidth(12);
  analogSetPinAttenuation(CDS_PIN, ADC_11db);
  analogSetPinAttenuation(SOIL_PIN, ADC_11db);
  analogSetPinAttenuation(TDS_PIN, ADC_11db);
  analogSetPinAttenuation(PH_PIN, ADC_11db);

  // LED
  strip.begin();
  strip.setBrightness(255);
  strip.clear();
  strip.show();
  setWhiteBrightness(currentPwm);

  // DHT
  dht.begin();
  delay(1500);

  // 네트워크 & MQTT
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(mqttCallback);
  client.setBufferSize(512);
  ensureMqtt();

  // 조도 초기 보정
  int initCds = analogRead(CDS_PIN);
  cdsMin = initCds;
  cdsMax = initCds + 1;
  cdsEma = initCds;
  adaptUntil = millis() + ADAPT_MS;
}

void loop() {
  if (!client.connected()) ensureMqtt();
  client.loop();

  // ── 조도 기반 LED 자동/수동 제어 ──
  static unsigned long t_led = 0;
  if (millis() - t_led >= 100) { // 10Hz
    t_led = millis();
    int cdsRaw = analogRead(CDS_PIN);
    cds = cdsRaw;
    if (autoMode) {
      uint8_t pwm = cdsToPwm(cdsRaw);
      if (abs((int)pwm - (int)currentPwm) >= 3) setWhiteBrightness(pwm);
    } else {
      if (currentPwm != manualPwm) setWhiteBrightness(manualPwm);
    }
  }

  // ── TDS 샘플링 ──
  static unsigned long t_analog = 0;
  if (millis() - t_analog > 40) {
    t_analog = millis();
    analogBuffer[analogBufferIndex] = analogRead(TDS_PIN);
    analogBufferIndex = (analogBufferIndex + 1) % SCOUNT;
  }

  // ── 환경 센서 ──
  static unsigned long t_env = 0;
  if (millis() - t_env >= 2000) {
    t_env = millis();
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t) && !isnan(h)) {
      temp = t;
      humi = h;
    }
    tds = getTDS(temp);
    int phRaw = analogRead(PH_PIN);
    ph = map(phRaw, 0, 4095, 140, 0) / 10.0;
  }

  // ── 5초마다 MQTT 발행 ──
  static unsigned long t_pub = 0;
  if (millis() - t_pub > 5000) {
    t_pub = millis();
    soil = soilPercentFromRaw(readSoilRawAvg(10));
    StaticJsonDocument<256> doc;
    doc["temp"] = temp;
    doc["humi"] = soil;
    doc["soil"] = humi;
    doc["cds"] = cds;
    doc["tds"] = tds;
    doc["ph"] = ph;
    char payload[192];
    size_t n = serializeJson(doc, payload);
    client.publish("etboard/sensor", payload, n);

    // 시리얼 출력 (라벨을 더 명확히)
    Serial.printf("PUB -> Temp:%.1f  HUMI(sent_as_soil):%.0f%%  SOIL(sent_as_humi):%.0f%%  Light:%.0f  TDS:%.1f  pH:%.1f\n",
                  temp, soil, humi, cds, tds, ph);
  }
}
