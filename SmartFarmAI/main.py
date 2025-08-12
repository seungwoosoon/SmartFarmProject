import cv2
from ultralytics import YOLO
import time
import requests  # 백엔드 통신용 라이브러리
import datetime  # 타임스탬프용 라이브러리
import json  # JSON 데이터 처리용 라이브러리


# --- 1. 백엔드 통신 함수 (최종 수정) ---
def send_to_backend(class_name, confidence):
    """분석 결과를 백엔드 서버로 전송합니다."""

    BACKEND_API_URL = "http://10.145.189.17:8080/api/diagnosis"
    DEVICE_ID = "ESP32-CAM-01"

    payload = {
        "deviceId": DEVICE_ID,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "detection": {
            "className": class_name,
            "confidence": round(confidence, 4)
        }
    }

    try:
        print(f"\n🚀 백엔드로 데이터 전송 시도...")
        print(f"URL: {BACKEND_API_URL}")
        print(f"DATA: {json.dumps(payload, indent=2)}")

        response = requests.post(BACKEND_API_URL, json=payload, timeout=10)

        response.raise_for_status()
        print(f"✅ 백엔드 전송 성공! 응답 코드: {response.status_code}")

        # 💡 [최종 수정] 응답 내용을 JSON으로 직접 변환 시도하고, 실패 시 예외 처리
        try:
            # 서버 응답을 JSON으로 변환 시도
            response_data = response.json()
            print(f"응답 내용: {response_data}")
        except json.JSONDecodeError:
            # JSON 변환 실패 시, 받은 텍스트를 그대로 출력
            print(f"응답 내용 (JSON 아님): {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"❌ 백엔드 전송 실패: {e}")


# --- 2. 모델 로드 및 추론 (기존 코드와 거의 동일) ---
try:
    model = YOLO('best.pt')
    print("YOLOv8 모델을 성공적으로 로드했습니다.")
except Exception as e:
    print(f"모델 로드 중 오류 발생: {e}")
    exit()

stream_url = 'http://10.145.189.86:81/stream'

# 💡 디버깅을 위해 print문 추가!
print(f"\n🎥 영상 스트림 연결을 시도합니다...")
print(f"URL: {stream_url}")

cap = cv2.VideoCapture(stream_url)

if not cap.isOpened():
    print(f"❌ 오류: 영상 스트림을 열 수 없습니다. URL 주소를 확인하세요: {stream_url}")
    exit()
else:
    print("✅ 스트림에 연결되었습니다. 잠시 후 사진을 한 장 촬영합니다...")

time.sleep(2)
ret, frame = cap.read()

if ret:
    print("사진 촬영 성공! 분석을 시작합니다...")
    results = model(frame)

    for r in results:
        annotated_frame = r.plot()
        cv2.imshow('Analysis Result', annotated_frame)

        print("\n--- 분석 결과 ---")
        if not r.boxes:
            print("탐지된 객체가 없습니다.")
        else:
            for box in r.boxes:
                class_id = int(box.cls[0])
                class_name = model.names[class_id]
                confidence = float(box.conf[0])
                print(f"✅ dignosis: {class_name}, confidence: {confidence:.2f}")

                # --- 3. 분석 결과를 백엔드로 전송 ---
                send_to_backend(class_name, confidence)

    print("\n결과 창이 나타났습니다. 창을 클릭하고 아무 키나 누르면 프로그램이 종료됩니다.")
    cv2.waitKey(0)
else:
    print("오류: 스트림에서 프레임을 읽어올 수 없습니다.")

cap.release()
cv2.destroyAllWindows()
print("프로그램을 종료합니다.")