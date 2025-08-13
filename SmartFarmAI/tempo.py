import cv2
from ultralytics import YOLO
import time
import requests
import datetime
import json
import schedule  # 1. 스케줄 라이브러리 import


# --- 백엔드 통신 함수 (변경 없음) ---
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
        try:
            response_data = response.json()
            print(f"응답 내용: {response_data}")
        except json.JSONDecodeError:
            print(f"응답 내용 (JSON 아님): {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ 백엔드 전송 실패: {e}")


# --- 2. 주기적으로 실행될 건강 검진 함수 ---
def perform_health_check(model):
    """카메라 촬영, AI 분석, 결과 전송까지의 전체 작업을 수행합니다."""
    print(f"\n========================================")
    print(f"⏰ 정기 건강 검진을 시작합니다... ({datetime.datetime.now()})")
    print(f"========================================")

    stream_url = 'http://10.145.189.86:81/stream'
    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():
        print(f"❌ 오류: 영상 스트림을 열 수 없습니다. URL: {stream_url}")
        return  # 함수 종료

    print("✅ 스트림 연결 성공. 2초 후 사진을 촬영합니다...")
    time.sleep(2)
    ret, frame = cap.read()
    cap.release()  # 프레임 캡처 후 바로 연결 해제

    if ret:
        print("📸 사진 촬영 성공! 분석을 시작합니다...")
        results = model(frame)

        # 분석 결과 처리
        if not results or not results[0].boxes:
            print("🚫 탐지된 객체가 없습니다.")
            return

        # 첫 번째 결과만 사용 (가장 신뢰도 높은 객체)
        r = results[0]
        box = r.boxes[0]
        class_id = int(box.cls[0])
        class_name = model.names[class_id]
        confidence = float(box.conf[0])

        print("\n--- 분석 결과 ---")
        print(f"✅ 진단명: {class_name}, 신뢰도: {confidence:.2f}")

        # 분석 결과를 백엔드로 전송
        send_to_backend(class_name, confidence)

        # (선택사항) 결과 이미지를 파일로 저장
        annotated_frame = r.plot()
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        cv2.imwrite(f"log/result_{timestamp_str}.jpg", annotated_frame)
        print(f"ℹ️ 결과 이미지를 'log/result_{timestamp_str}.jpg'에 저장했습니다.")

    else:
        print("❌ 오류: 스트림에서 프레임을 읽어올 수 없습니다.")

    print("\n✅ 정기 건강 검진 완료.")


# --- 3. 메인 실행 블록: 스케줄러 설정 및 실행 ---
if __name__ == "__main__":
    # 프로그램 시작 시 모델을 한 번만 로드
    try:
        yolo_model = YOLO('best.pt')
        print("✅ YOLOv8 모델을 성공적으로 로드했습니다.")
    except Exception as e:
        print(f"❌ 모델 로드 중 심각한 오류 발생: {e}")
        exit()
    # 'log' 폴더가 없으면 생성
    import os

    if not os.path.exists('log'):
        os.makedirs('log')

    # --- 👇 여기가 스케줄링 설정 부분입니다! ---
    # 예시 1: 매주 일요일 오전 10시에 실행
    # schedule.every().tuesday.at("13:29").do(perform_health_check, model=yolo_model)

    # 예시 2: 테스트용으로 매 1분마다 실행
    # schedule.every(1).minutes.do(perform_health_check, model=yolo_model)

    # 수정 코드 (30초마다)
    schedule.every(5).seconds.do(perform_health_check, model=yolo_model)

    print("\n👍 스케줄러가 시작되었습니다. 다음 예약된 시간에 작업이 자동으로 실행됩니다.")
    print(f"현재 예약된 작업: {schedule.get_jobs()}")

    # 무한 루프를 돌면서 스케줄을 계속 확인
    while True:
        schedule.run_pending()
        time.sleep(1)