import cv2
from ultralytics import YOLO
import time
import requests
import datetime
import json
import os
import logging

# --- 로깅 설정 ---
# 안정적인 로그 출력을 위해 이모지 대신 텍스트 태그를 사용합니다.
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("client.log", encoding='utf-8'),
        logging.StreamHandler(sys.stdout)  # stdout으로 명시적 지정
    ]
)


# --- 백엔드 통신 함수 ---
def send_to_backend(class_name, confidence):
    """분석 결과를 백엔드 서버로 전송하고 상세 로그를 남깁니다."""
    BACKEND_API_URL = "http://52.0.13.216/api/diagnosis"
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
        logging.info("[BACKEND] 백엔드로 데이터 전송 시도...")
        headers = {'Content-Type': 'application/json'}

        logging.info(f"URL: {BACKEND_API_URL}")
        logging.info(f"HEADERS: {headers}")
        logging.info(f"DATA (JSON):\n{json.dumps(payload, indent=2)}")

        response = requests.post(BACKEND_API_URL, headers=headers, json=payload, timeout=15)

        logging.info("--- [RESPONSE] 백엔드로부터 받은 응답 ---")
        logging.info(f"상태 코드 (Status Code): {response.status_code}")
        logging.info(f"응답 내용 (Raw Text Body): {response.text}")
        logging.info("------------------------------------")

        response.raise_for_status()

        logging.info("[SUCCESS] 백엔드 통신 작업 자체는 성공적으로 완료되었습니다.")

    except requests.exceptions.RequestException as e:
        logging.error(f"[ERROR] 백엔드 전송 중 예외 발생: {e}")


# --- 로컬 이미지 건강 검진 함수 ---
def perform_health_check_from_file(model, image_path):
    """지정된 이미지 파일을 로드하여 AI 분석을 수행하고 결과를 전송합니다."""
    logging.info("\n========================================")
    logging.info(f"[CAMERA] 팜링크 이미지 건강 검진을 시작합니다...")
#    logging.info(f"대상 파일: {image_path}")
    logging.info(f"이미지 전달 중...")
    logging.info("========================================")

    try:
        # 1. 이미지 파일을 읽어들입니다.
        frame = cv2.imread(image_path)
        if frame is None:
            logging.error(f"[ERROR] 이미지 파일을 읽을 수 없습니다.")
            return

        # 2. AI 모델로 분석을 수행합니다.
        logging.info("[IMAGE] 이미지, 모델에 로드 성공! 분석을 시작합니다...")
        results = model(frame)

        # 3. 분석 결과를 처리합니다.
        if not results or not results[0].boxes:
            logging.warning("[WARNING] 탐지된 객체가 없습니다.")
            return

        # 가장 신뢰도 높은 첫 번째 결과만 사용
        r = results[0]
        box = r.boxes[0]
        class_id = int(box.cls[0])
        class_name = model.names[class_id]
        confidence = float(box.conf[0])

        logging.info("\n--- [AI] 분석 결과 ---")
        logging.info(f"[SUCCESS] 진단명: {class_name}, 신뢰도: {confidence:.2f}")

        # 4. 분석 결과를 백엔드로 전송합니다.
        send_to_backend(class_name, confidence)

        # 5. 분석 결과가 표시된 이미지를 파일로 저장합니다.
        annotated_frame = r.plot()
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"log/result_local_{timestamp_str}.jpg"
        cv2.imwrite(output_filename, annotated_frame)
        logging.info(f"[INFO] 결과 이미지를 '{output_filename}'에 저장했습니다.")

        # 6. 분석 결과를 화면에 표시합니다.
        logging.info("[DISPLAY] 분석 결과를 화면에 표시합니다...")

        # 원본 이미지와 결과 이미지를 나란히 표시
        # 원본 이미지 크기 조정
        original_resized = cv2.resize(frame, (400, 300))
        result_resized = cv2.resize(annotated_frame, (400, 300))

        # 두 이미지를 가로로 연결
        combined_image = cv2.hconcat([original_resized, result_resized])

        # 텍스트 정보 추가
        info_text = f"Diagnosis: {class_name} (Confidence: {confidence:.2f})"
        cv2.putText(combined_image, info_text, (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(combined_image, "Original", (10, 280),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(combined_image, "AI Analysis Result", (410, 280),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # 창 이름 설정
        window_name = "SmartFarm AI - Tomato Health Analysis"
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(window_name, 800, 350)

        # 이미지 표시
        cv2.imshow(window_name, combined_image)

        logging.info("[DISPLAY] 결과 창이 열렸습니다. 아무 키나 누르면 창이 닫힙니다.")
        cv2.waitKey(0)  # 아무 키나 누를 때까지 대기
        cv2.destroyAllWindows()  # 모든 창 닫기

    except Exception as e:
        logging.error(f"[ERROR] 이미지 처리 중 오류 발생: {e}")

    logging.info("\n[SUCCESS] 로컬 이미지 건강 검진 완료.")


# --- 메인 실행 블록 ---
if __name__ == "__main__":

    # 1. AI 모델을 로드합니다.
    try:
        yolo_model = YOLO('best.pt')
        logging.info("[SUCCESS] YOLOv8 모델을 성공적으로 로드했습니다.")
    except Exception as e:
        logging.critical(f"[CRITICAL] 모델 로드 중 심각한 오류 발생: {e}")
        exit()

    # 2. 결과 이미지를 저장할 'log' 폴더를 생성합니다.
    if not os.path.exists('log'):
        os.makedirs('log')

    # --- 분석할 이미지 파일 경로를 여기에 입력하세요! ---
    # 경로의 '\'를 '/'로 바꾸거나, '\\'로 두 번 써주세요.
    #image_to_analyze = "C:/Users/USER/Desktop/image_ex/class0_001.jpg"
    #image_to_analyze = "C:/Users/USER/Desktop/image_ex/class1_019.jpg"
    #image_to_analyze = "C:/Users/USER/Desktop/image_ex/class2_025.jpg"
    image_to_analyze = "C:/Users/USER/Desktop/image_ex/class3_002.jpg"
    #image_to_analyze = "C:/Users/USER/Desktop/image_ex/class4_002.jpg"
    #image_to_analyze = "C:/Users/USER/Desktop/image_ex/class5_002.jpg"

    # 3. 지정된 이미지 파일로 분석 함수를 호출합니다.
    perform_health_check_from_file(yolo_model, image_to_analyze)