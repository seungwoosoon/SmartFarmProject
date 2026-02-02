# Camera Web Server Module
스마트팜 프로젝트의 카메라 모니터링 모듈입니다.

## 📋 담당 기능
- 실시간 영상 스트리밍
- 정지 이미지 캡처
- LED 플래시 제어
- 웹 인터페이스 제공

## 🛠 사용 하드웨어
- ESP32-CAM (AI-Thinker)
- OV2640 카메라 센서

## 🔧 초기 설정

### WiFi 및 민감정보 설정
1. `credentials_template.h` 파일을 `credentials.h`로 복사
2. `credentials.h` 파일을 열어서 실제 값들을 입력:
   - `WIFI_SSID`: 연결할 WiFi 이름
   - `WIFI_PASSWORD`: WiFi 비밀번호
   - `AP_PASSWORD`: ESP32 AP 모드 비밀번호 (8자리 이상)

**예시:**
```cpp
// credentials.h 파일 내용
#define WIFI_SSID "MyWiFiNetwork"
#define WIFI_PASSWORD "mypassword123"
#define AP_SSID "ESP32-CAM-AP"
#define AP_PASSWORD "smartfarm2025"
```

### 보드 설정 (Arduino IDE)
- Board: AI Thinker ESP32-CAM
- Partition Scheme: Huge APP (3MB No OTA/1MB SPIFFS)
- PSRAM: Enabled

### 컴파일 및 업로드
```bash
# Arduino IDE 또는 PlatformIO로 컴파일 후 ESP32에 업로드
```

## 📡 API 엔드포인트
| 엔드포인트 | 메소드 | 설명 |
|-----------|--------|------|
| `/` | GET | 웹 컨트롤 인터페이스 |
| `/capture` | GET | 현재 이미지 캡처 |
| `/stream` | GET | MJPEG 비디오 스트림 |
| `/status` | GET | 카메라 상태 (JSON) |
| `/control` | GET | 카메라 설정 변경 |

## 🔗 다른 모듈과의 연동
### 데이터 형식
```json
{
  "module": "camera",
  "status": "active",
  "stream_url": "http://[IP]:81/stream",
  "capture_url": "http://[IP]/capture"
}
```

## 📸 사용 예시
### 이미지 캡처
```
http://192.168.1.100/capture
```
### 실시간 스트리밍
```
http://192.168.1.100:81/stream
```

## ⚠️ 주의사항
- 2.4GHz WiFi만 지원
- 충분한 전원 공급 필요 (5V, 2A 이상)
- PSRAM 활성화 필수
- `credentials.h` 파일은 Git에 커밋하지 않음 (보안)

## 🐛 트러블슈팅
### 카메라 초기화 실패
- 전원 재공급
- 카메라 커넥터 재연결

### WiFi 연결 실패  
- 30초 후 AP 모드 자동 전환
- SSID: ESP32-CAM-AP
- Password: credentials.h에서 설정한 AP_PASSWORD 값

### credentials.h 파일 없음 에러
- `credentials_template.h`를 `credentials.h`로 복사
- 실제 WiFi 정보로 수정 후 컴파일

## 📁 프로젝트 구조
```
CameraWebServer/
├── CameraWebServer.ino          # 메인 코드
├── credentials.h                # WiFi 설정 (Git 제외)
├── credentials_template.h       # 설정 템플릿
├── .gitignore                  # Git 제외 파일 목록
├── README.md                   # 이 파일
├── app_httpd.cpp              # 웹서버 코드
├── camera_index.h             # 웹페이지 HTML
├── camera_pins.h              # 핀 설정
└── attachments.zip            # 기타 파일들
```

## 📝 업데이트 내역
- 2025.08.07 - 민감정보 분리 및 보안 강화
- 2025.08.07 - 초기 버전 업로드

---
담당자: [유지찬]