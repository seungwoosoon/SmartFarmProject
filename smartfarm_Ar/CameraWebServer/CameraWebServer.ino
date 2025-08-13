#include "esp_camera.h"
#include <WiFi.h>
#include <Preferences.h>  // 추가: WiFi 정보 저장용

//
// WARNING!!! PSRAM IC required for UXGA resolution and high JPEG quality
//            Ensure ESP32 Wrover Module or other board with PSRAM is selected
//            Partial images will be transmitted if image exceeds buffer size
//
//            You must select partition scheme from the board menu that has at least 3MB APP space.
//            Face Recognition is DISABLED for ESP32 and ESP32-S2, because it takes up from 15 
//            seconds to process single frame. Face Detection is ENABLED if PSRAM is enabled as well

// ===================
// Select camera model
// ===================
#define CAMERA_MODEL_AI_THINKER // Has PSRAM
#include "camera_pins.h"

// ===========================
// WiFi 설정 관리
// ===========================
Preferences preferences;
#include "credentials.h"

String ssid = WIFI_SSID;
String password = WIFI_PASSWORD;
const char* ap_ssid = AP_SSID;
const char* ap_password = AP_PASSWORD;

void startCameraServer();
void setupLedFlash(int pin);

// WiFi 설정 로드 함수
void loadWiFiSettings() {
  preferences.begin("wifi-config", false);
  ssid = preferences.getString("ssid", "");
  password = preferences.getString("password", "");
  
  if (ssid == "" || password == "") {
    Serial.println("No WiFi credentials stored. Using default or AP mode.");
    // 기본값 설정 (필요시 여기서 기본 WiFi 정보 설정)
    ssid = "Galaxy";  // 기본값 (테스트용)
    password = "123456789";  // 기본값 (테스트용)
  }
  preferences.end();
}

// WiFi 설정 저장 함수
void saveWiFiSettings(String new_ssid, String new_password) {
  preferences.begin("wifi-config", false);
  preferences.putString("ssid", new_ssid);
  preferences.putString("password", new_password);
  preferences.end();
  Serial.println("WiFi settings saved!");
}

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  // WiFi 설정 로드
  loadWiFiSettings();

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  
  // ===========================
  // 성능 최적화 설정
  // ===========================
  config.xclk_freq_hz = 10000000;  // 20MHz -> 10MHz로 낮춤 (안정성 향상)
  config.frame_size = FRAMESIZE_VGA;  // 초기 해상도를 VGA로 설정 (640x480)
  config.pixel_format = PIXFORMAT_JPEG; // for streaming
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 15;  // JPEG 품질 조정 (10-63, 낮을수록 품질 좋음)
  config.fb_count = 1;
  
  // PSRAM이 있는 경우 설정 조정
  if(config.pixel_format == PIXFORMAT_JPEG){
    if(psramFound()){
      Serial.println("PSRAM found, using enhanced settings");
      config.jpeg_quality = 12;  // PSRAM 있을 때 품질 향상
      config.fb_count = 2;
      config.grab_mode = CAMERA_GRAB_LATEST;
      // 나중에 더 높은 해상도로 변경 가능
      config.frame_size = FRAMESIZE_SVGA;  // 800x600
    } else {
      Serial.println("PSRAM not found, using limited settings");
      // PSRAM이 없는 경우 제한된 설정
      config.frame_size = FRAMESIZE_CIF;  // 400x296
      config.fb_location = CAMERA_FB_IN_DRAM;
      config.jpeg_quality = 20;  // 메모리 절약을 위해 품질 낮춤
    }
  } else {
    // Best option for face detection/recognition
    config.frame_size = FRAMESIZE_240X240;
#if CONFIG_IDF_TARGET_ESP32S3
    config.fb_count = 2;
#endif
  }

#if defined(CAMERA_MODEL_ESP_EYE)
  pinMode(13, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
#endif

  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  sensor_t * s = esp_camera_sensor_get();
  // initial sensors are flipped vertically and colors are a bit saturated
  if (s->id.PID == OV3660_PID) {
    s->set_vflip(s, 1); // flip it back
    s->set_brightness(s, 1); // up the brightness just a bit
    s->set_saturation(s, -2); // lower the saturation
  }
  
  // 성능 최적화: 스트리밍을 위한 초기 프레임 크기 설정
  if(config.pixel_format == PIXFORMAT_JPEG){
    // 초기에는 낮은 해상도로 시작
    s->set_framesize(s, FRAMESIZE_QVGA);  // 320x240
  }

#if defined(CAMERA_MODEL_M5STACK_WIDE) || defined(CAMERA_MODEL_M5STACK_ESP32CAM)
  s->set_vflip(s, 1);
  s->set_hmirror(s, 1);
#endif

#if defined(CAMERA_MODEL_ESP32S3_EYE)
  s->set_vflip(s, 1);
#endif

// Setup LED FLash if LED pin is defined in camera_pins.h
#if defined(LED_GPIO_NUM)
  setupLedFlash(LED_GPIO_NUM);
#endif

  // ===========================
  // WiFi 연결 (타임아웃 포함)
  // ===========================
  WiFi.begin(ssid.c_str(), password.c_str());
  WiFi.setSleep(false);

  Serial.printf("Connecting to WiFi SSID: %s\n", ssid.c_str());
  
  int wifi_timeout = 0;
  while (WiFi.status() != WL_CONNECTED && wifi_timeout < 30) {
    delay(500);
    Serial.print(".");
    wifi_timeout++;
  }
  Serial.println("");
  
  // WiFi 연결 실패 시 AP 모드로 전환
  if (wifi_timeout >= 30) {
    Serial.println("WiFi connection failed! Starting AP mode...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ap_ssid, ap_password);
    
    IPAddress IP = WiFi.softAPIP();
    Serial.print("AP Mode Started. Connect to WiFi: ");
    Serial.println(ap_ssid);
    Serial.print("Password: ");
    Serial.println(ap_password);
    Serial.print("Camera Stream URL: http://");
    Serial.print(IP);
    Serial.println("/");
  } else {
    // WiFi 연결 성공
    Serial.println("WiFi connected successfully!");
    Serial.print("Camera Ready! Use 'http://");
    Serial.print(WiFi.localIP());
    Serial.println("' to connect");
  }

  startCameraServer();
}

void loop() {
  // WiFi 재연결 체크 (Station 모드인 경우만)
  static unsigned long lastCheck = 0;
  unsigned long currentMillis = millis();
  
  if (WiFi.getMode() == WIFI_STA && currentMillis - lastCheck > 30000) {  // 30초마다 체크
    lastCheck = currentMillis;
    
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi disconnected. Attempting to reconnect...");
      WiFi.disconnect();
      WiFi.begin(ssid.c_str(), password.c_str());
      
      int reconnect_timeout = 0;
      while (WiFi.status() != WL_CONNECTED && reconnect_timeout < 20) {
        delay(500);
        Serial.print(".");
        reconnect_timeout++;
      }
      
      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nReconnected to WiFi!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
      } else {
        Serial.println("\nReconnection failed. Starting AP mode...");
        WiFi.mode(WIFI_AP);
        WiFi.softAP(ap_ssid, ap_password);
        Serial.print("AP Mode: ");
        Serial.println(WiFi.softAPIP());
      }
    }
  }
  
  delay(10000);
}

// WiFi 설정 변경 함수 (웹 인터페이스나 시리얼 명령으로 호출 가능)
void updateWiFiCredentials(String new_ssid, String new_password) {
  saveWiFiSettings(new_ssid, new_password);
  Serial.println("New WiFi settings saved. Restarting...");
  delay(1000);
  ESP.restart();
}