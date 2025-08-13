import cv2
from ultralytics import YOLO
import time
import requests
import datetime
import json
import os
import logging

# --- 로깅 설정 ---
# 윈도우의 cp949 인코딩 문제를 해결하기 위해 encoding='utf-8'을 추가합니다.
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    encoding='utf-8',  # 💡 이모지 및 한글 깨짐 방지를 위한 핵심 코드
    handlers=[
        logging.FileHandler("client.log"),
        logging.StreamHandler()
    ]
)


# --- 백엔드 통신 함수 ---
def send_to_backend(class_name, confidence):
    """분석 결과를 백엔드 서버로 전송하고 상세 로그를 남깁니다."""
    BACKEND_API_URL = "http://54.166.203.174/api/diagnosis"
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
        logging.info("🚀 백엔드로 데이터 전송 시도...")
        headers = {'Content-Type': 'application/json'}

        logging.info(f"URL: {BACKEND_API_URL}")
        logging.info(f"HEADERS: {headers}")
        logging.info(f"DATA (JSON):\n{json.dumps(payload, indent=2)}")

        response = requests.post(BACKEND_API_URL, headers=headers, json=payload, timeout=15)

        logging.info("--- ⬇️ 백엔드로부터 받은 응답 ⬇️ ---")
        logging.info(f"상태 코드 (Status Code): {response.status_code}")
        logging.info(f"응답 내용 (Raw Text Body): {response.text}")
        logging.info("------------------------------------")

        response.raise_for_status()

        logging.info("✅ 백엔드 통신 작업 자체는 성공적으로 완료되었습니다.")

    except requests.exceptions.RequestException as e:
        logging.error(f"❌ 백엔드 전송 중 예외 발생: {e}")


# --- 로컬 이미지 건강 검진 함수 ---
def perform_health_check_from_file(model, image_path):
    """지정된 이미지 파일을 로드하여 AI 분석을 수행하고 결과를 전송합니다."""
    logging.info("\n========================================")
    logging.info(f"📸 로컬 이미지 건강 검진을 시작합니다...")
    logging.info(f"대상 파일: {image_path}")
    logging.info("========================================")

    try:
        # 1. 이미지 파일을 읽어들입니다.
        frame = cv2.imread(image_path)
        if frame is None:
            logging.error(f"오류: 이미지 파일을 읽을 수 없거나 파일이 존재하지 않습니다. 경로를 확인해주세요.")
            return

        # 2. AI 모델로 분석을 수행합니다.
        logging.info("🖼️ 이미지 파일 로드 성공! 분석을 시작합니다...")
        results = model(frame)

        # 3. 분석 결과를 처리합니다.
        if not results or not results[0].boxes:
            logging.warning("🚫 탐지된 객체가 없습니다.")
            return

        # 가장 신뢰도 높은 첫 번째 결과만 사용
        r = results[0]
        box = r.boxes[0]
        class_id = int(box.cls[0])
        class_name = model.names[class_id]
        confidence = float(box.conf[0])

        logging.info("\n--- 분석 결과 ---")
        logging.info(f"✅ 진단명: {class_name}, 신뢰도: {confidence:.2f}")

        # 4. 분석 결과를 백엔드로 전송합니다.
        send_to_backend(class_name, confidence)

        # 5. 분석 결과가 표시된 이미지를 파일로 저장합니다.
        annotated_frame = r.plot()
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"log/result_local_{timestamp_str}.jpg"
        cv2.imwrite(output_filename, annotated_frame)
        logging.info(f"ℹ️ 결과 이미지를 '{output_filename}'에 저장했습니다.")

    except Exception as e:
        logging.error(f"❌ 이미지 처리 중 오류 발생: {e}")

    logging.info("\n✅ 로컬 이미지 건강 검진 완료.")


# --- 메인 실행 블록 ---
if __name__ == "__main__":

    # 1. AI 모델을 로드합니다.
    try:
        yolo_model = YOLO('best.pt')
        logging.info("✅ YOLOv8 모델을 성공적으로 로드했습니다.")
    except Exception as e:
        logging.critical(f"❌ 모델 로드 중 심각한 오류 발생: {e}")
        exit()

    # 2. 결과 이미지를 저장할 'log' 폴더를 생성합니다.
    if not os.path.exists('log'):
        os.makedirs('log')

    # --- 👇 분석할 이미지 파일 경로를 여기에 입력하세요! ---
    # 경로의 '\'를 '/'로 바꾸거나, '\\'로 두 번 써주세요.
    image_to_analyze = "C:/Users/USER/Downloads/class1_019.jpg"

    # 3. 지정된 이미지 파일로 분석 함수를 호출합니다.
    perform_health_check_from_file(yolo_model, image_to_analyze)