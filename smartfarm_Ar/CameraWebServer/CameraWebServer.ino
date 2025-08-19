#include "esp_camera.h"
#include <WiFi.h>
#include <Preferences.h>  // WiFi 정보 저장용
#include <ArduinoJson.h>  // JSON 파싱 라이브러리 추가
#include <WebServer.h>    // 웹서버 라이브러리 추가

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

// 웹서버 객체 (제어용)
WebServer controlServer(80);  // 제어용 서버

void startCameraServer();
void setupLedFlash(int pin);
void setupControlServer();  // 제어 서버 설정 함수 추가

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

// ===========================
// 딥슬립 제어 함수들
// ===========================
void handleControl() {
  Serial.println("[CONTROL] 제어 명령 수신");
  
  // POST 요청 본문 읽기
  String body = controlServer.arg("plain");
  Serial.printf("[DEBUG] 수신된 데이터: %s\n", body.c_str());
  
  // JSON 파싱
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, body);
  
  if (error) {
    Serial.printf("[ERROR] JSON 파싱 실패: %s\n", error.c_str());
    controlServer.send(400, "application/json", "{\"status\":\"error\",\"message\":\"Invalid JSON\"}");
    return;
  }
  
  // 명령어 추출
  String command = doc["command"];
  Serial.printf("[COMMAND] 수신된 명령: %s\n", command.c_str());
  
  if (command == "deep_sleep") {
    int duration = doc["duration"];
    Serial.printf("[DEEP_SLEEP] 딥슬립 시작 - 지속시간: %d초\n", duration);
    
    // 성공 응답 먼저 전송
    controlServer.send(200, "application/json", "{\"status\":\"success\",\"message\":\"Going to deep sleep\"}");
    
    // 잠시 대기 (응답 전송 완료를 위해)
    delay(100);
    
    // 딥슬립 설정 및 실행
    esp_sleep_enable_timer_wakeup(duration * 1000000ULL);  // 마이크로초 단위
    Serial.println("[DEEP_SLEEP] ESP32-CAM이 딥슬립 모드로 전환됩니다...");
    Serial.flush();  // 시리얼 출력 완료 대기
    
    esp_deep_sleep_start();
    
  } else if (command == "status") {
    // 상태 확인 명령
    String statusJson = "{";
    statusJson += "\"status\":\"active\",";
    statusJson += "\"uptime\":" + String(millis()) + ",";
    statusJson += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
    statusJson += "\"wifi_rssi\":" + String(WiFi.RSSI());
    statusJson += "}";
    
    controlServer.send(200, "application/json", statusJson);
    Serial.println("[STATUS] 상태 정보 전송 완료");
    
  } else if (command == "restart") {
    // 재시작 명령
    Serial.println("[RESTART] ESP32-CAM 재시작 요청");
    controlServer.send(200, "application/json", "{\"status\":\"success\",\"message\":\"Restarting\"}");
    delay(100);
    ESP.restart();
    
  } else {
    // 알 수 없는 명령
    Serial.printf("[ERROR] 알 수 없는 명령: %s\n", command.c_str());
    controlServer.send(400, "application/json", "{\"status\":\"error\",\"message\":\"Unknown command\"}");
  }
}

void handleControlRoot() {
  // 제어 API 설명 페이지
  String html = "<html><body>";
  html += "<h1>ESP32-CAM Control API</h1>";
  html += "<h2>Available Commands:</h2>";
  html += "<p><b>POST /control</b></p>";
  html += "<ul>";
  html += "<li>Deep Sleep: {\"command\":\"deep_sleep\",\"duration\":259200}</li>";
  html += "<li>Status: {\"command\":\"status\"}</li>";
  html += "<li>Restart: {\"command\":\"restart\"}</li>";
  html += "</ul>";
  html += "<p>Current Status: Active</p>";
  html += "<p>Uptime: " + String(millis()/1000) + " seconds</p>";
  html += "<p>Free Heap: " + String(ESP.getFreeHeap()) + " bytes</p>";
  html += "</body></html>";
  
  controlServer.send(200, "text/html", html);
}

void handleNotFound() {
  controlServer.send(404, "application/json", "{\"status\":\"error\",\"message\":\"Endpoint not found\"}");
}

void setupControlServer() {
  // 제어 서버 라우팅 설정
  controlServer.on("/", HTTP_GET, handleControlRoot);
  controlServer.on("/control", HTTP_POST, handleControl);
  controlServer.onNotFound(handleNotFound);
  
  // CORS 헤더 설정 (크로스 오리진 요청 허용)
  controlServer.enableCORS(true);
  
  // 제어 서버 시작
  controlServer.begin();
  Serial.println("[SERVER] 제어 서버 시작 완료 (포트 80)");
}

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();
  
  // 부팅 원인 확인
  esp_sleep_wakeup_cause_t wakeup_reason = esp_sleep_get_wakeup_cause();
  switch(wakeup_reason) {
    case ESP_SLEEP_WAKEUP_TIMER:
      Serial.println("[WAKEUP] 타이머에 의한 딥슬립 해제");
      break;
    case ESP_SLEEP_WAKEUP_EXT0:
      Serial.println("[WAKEUP] 외부 신호에 의한 딥슬립 해제");
      break;
    default:
      Serial.println("[WAKEUP] 정상 부팅 또는 기타 원인");
      break;
  }

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
    Serial.print("Control API URL: http://");
    Serial.print(IP);
    Serial.println("/control");
  } else {
    // WiFi 연결 성공
    Serial.println("WiFi connected successfully!");
    Serial.print("Camera Ready! Use 'http://");
    Serial.print(WiFi.localIP());
    Serial.println("' to connect");
    Serial.print("Control API: http://");
    Serial.print(WiFi.localIP());
    Serial.println("/control");
  }

  // 카메라 서버 시작 (포트 81)
  startCameraServer();
  
  // 제어 서버 시작 (포트 80)
  setupControlServer();
  
  Serial.println("[SETUP] ESP32-CAM 초기화 완료");
  Serial.println("[INFO] 딥슬립 제어 기능 활성화");
}

void loop() {
  // 제어 서버 요청 처리
  controlServer.handleClient();
  
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
  
  delay(100);  // 10초 → 100ms로 단축 (제어 서버 응답성 향상)
}

// WiFi 설정 변경 함수 (웹 인터페이스나 시리얼 명령으로 호출 가능)
void updateWiFiCredentials(String new_ssid, String new_password) {
  saveWiFiSettings(new_ssid, new_password);
  Serial.println("New WiFi settings saved. Restarting...");
  delay(1000);
  ESP.restart();
}