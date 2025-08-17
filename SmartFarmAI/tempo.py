import cv2
from ultralytics import YOLO
import time
import requests
import datetime
import json
import schedule
import os
import logging
import sys
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Optional


# --- 데이터 클래스 ---
@dataclass
class LeafAnalysisResult:
    measurement_number: int
    class_name: str
    confidence: float
    image_quality_score: float
    timestamp: datetime.datetime
    image_path: str


# --- ESP32-CAM 잎사진 분석 시스템 ---
class ESP32CamLeafAnalyzer:
    def __init__(self, model_path: str):
        self.model = YOLO(model_path)
        self.setup_logging()

        # ESP32-CAM 네트워크 설정
        self.esp32_stream_url = 'http://10.185.150.86:81/stream'
        self.esp32_control_url = "http://10.185.150.86/control"
        self.backend_api_url = "http://10.145.189.17:8080/api/diagnosis"
        self.device_id = "ESP32-CAM-01"

        # 6개 클래스 정의 (프로젝트 고정)
        self.expected_classes = [
            'Normal',
            'Gray mold',
            'Powdery mildew',
            'Nitrogen deficiency',
            'Phosphorus deficiency',
            'Potassium deficiency'
        ]

        # 이미지 품질 기준
        self.quality_thresholds = {
            "min_brightness": 40,
            "max_brightness": 220,
            "min_sharpness": 80,
            "min_quality_score": 0.3
        }

    def setup_logging(self):
        """로깅 설정"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler("esp32cam_leaf_analyzer.log", encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )

    def check_esp32_connection(self) -> bool:
        """ESP32-CAM 연결 상태 확인"""
        try:
            cap = cv2.VideoCapture(self.esp32_stream_url)
            if cap.isOpened():
                ret, frame = cap.read()
                cap.release()
                return ret and frame is not None
            return False
        except Exception as e:
            logging.error(f"[ERROR] ESP32-CAM 연결 확인 실패: {e}")
            return False

    def wait_for_esp32_ready(self, max_wait_seconds: int = 30) -> bool:
        """ESP32-CAM이 딥슬립에서 깨어날 때까지 대기"""
        logging.info("[CAMERA] ESP32-CAM 연결 대기 중...")

        for i in range(max_wait_seconds):
            if self.check_esp32_connection():
                logging.info("[SUCCESS] ESP32-CAM 연결 성공")
                return True
            time.sleep(1)

        logging.error("[ERROR] ESP32-CAM 연결 타임아웃")
        return False

    def capture_high_quality_frame(self) -> tuple[np.ndarray, float]:
        """고품질 잎사진 촬영 (3개 프레임 중 최고 품질 선택)"""
        cap = cv2.VideoCapture(self.esp32_stream_url)

        if not cap.isOpened():
            logging.error("[ERROR] 스트림 연결 실패")
            return None, 0.0

        try:
            # ESP32-CAM 최적 설정 (잎사진 촬영용)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1600)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1200)
            cap.set(cv2.CAP_PROP_FPS, 15)

            # 카메라 안정화 대기
            time.sleep(1)
            logging.info("[CAMERA] 잎사진 촬영 중...")

            # 3개 프레임 촬영 후 최고 품질 선택
            best_frame = None
            best_score = 0

            for attempt in range(3):
                ret, frame = cap.read()
                if ret and frame is not None:
                    quality_score = self.calculate_image_quality(frame)
                    logging.info(f"[INFO] 프레임 {attempt + 1}: 품질 점수 {quality_score:.2f}")

                    if quality_score > best_score:
                        best_score = quality_score
                        best_frame = frame.copy()

                time.sleep(0.2)  # 프레임 간격

            cap.release()
            logging.info(f"[SUCCESS] 최고 품질 프레임 선택 (점수: {best_score:.2f})")
            return best_frame, best_score

        except Exception as e:
            cap.release()
            logging.error(f"[ERROR] 프레임 캡처 오류: {e}")
            return None, 0.0

    def calculate_image_quality(self, frame) -> float:
        """이미지 품질 점수 계산 (0.0 ~ 1.0)"""
        if frame is None:
            return 0.0

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # 1. 밝기 점수 (적절한 밝기 범위 확인)
        brightness = np.mean(gray)
        if 50 <= brightness <= 200:
            brightness_score = 1.0
        else:
            brightness_score = max(0.0, 1.0 - abs(brightness - 125) / 125)

        # 2. 선명도 점수 (라플라시안 분산으로 블러 검출)
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
        sharpness_score = min(sharpness / 200, 1.0)

        # 3. 대비 점수 (표준편차로 명암 확인)
        contrast = np.std(gray)
        contrast_score = min(contrast / 50, 1.0)

        # 가중 평균으로 종합 점수 (잎사진에 최적화)
        total_score = (brightness_score * 0.4 +  # 밝기 40%
                       sharpness_score * 0.4 +  # 선명도 40%
                       contrast_score * 0.2)  # 대비 20%

        return total_score

    def preprocess_leaf_image(self, frame):
        """ESP32-CAM 잎사진 특화 전처리"""
        if frame is None:
            return None

        # 1. 선명도 강화 (ESP32-CAM 블러 보상)
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        sharpened = cv2.filter2D(frame, -1, kernel)

        # 2. 적응적 히스토그램 평활화 (잎의 조명 불균형 보정)
        lab = cv2.cvtColor(sharpened, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

        # 3. 노이즈 제거 (MJPEG 압축 아티팩트 제거)
        denoised = cv2.bilateralFilter(enhanced, 5, 50, 50)

        return denoised

    def analyze_leaf_with_ai(self, frame) -> dict:
        """AI 모델을 사용한 잎 질병 분석"""
        try:
            # 잎사진 전처리 적용
            processed_frame = self.preprocess_leaf_image(frame)

            # YOLOv8 모델 추론 실행
            results = self.model(processed_frame)

            if not results or not results[0].boxes:
                return None  # 탐지 실패

            # 가장 신뢰도 높은 결과 선택
            box = results[0].boxes[0]
            class_id = int(box.cls[0])
            class_name = self.model.names[class_id]
            confidence = float(box.conf[0])

            # 6개 클래스 검증
            if class_name not in self.expected_classes:
                logging.warning(f"[WARNING] 예상하지 못한 클래스: {class_name}")

            # 결과 이미지 생성 (바운딩 박스 + 라벨)
            annotated_frame = results[0].plot()

            return {
                "class_name": class_name,
                "confidence": confidence,
                "class_id": class_id,
                "annotated_image": annotated_frame
            }

        except Exception as e:
            logging.error(f"[ERROR] AI 분석 오류: {e}")
            return None

    def perform_single_leaf_measurement(self, measurement_num: int) -> LeafAnalysisResult:
        """단일 잎사진 분석 측정"""
        logging.info(f"[INFO] 측정 #{measurement_num} 시작")

        # 1. 고품질 잎사진 촬영
        frame, quality_score = self.capture_high_quality_frame()

        # 2. 품질 검증
        if frame is None or quality_score < self.quality_thresholds["min_quality_score"]:
            logging.warning(f"[WARNING] 측정 #{measurement_num}: 이미지 품질 부족 (점수: {quality_score:.2f})")
            return None

        # 3. AI 잎 분석 수행
        ai_result = self.analyze_leaf_with_ai(frame)

        if not ai_result:
            logging.warning(f"[WARNING] 측정 #{measurement_num}: AI 분석 실패")
            return None

        # 4. 결과 저장
        timestamp = datetime.datetime.now()
        timestamp_str = timestamp.strftime("%Y%m%d_%H%M%S")
        image_filename = f"log/leaf_analysis_{measurement_num}_{timestamp_str}.jpg"

        cv2.imwrite(image_filename, ai_result["annotated_image"])

        result = LeafAnalysisResult(
            measurement_number=measurement_num,
            class_name=ai_result["class_name"],
            confidence=ai_result["confidence"],
            image_quality_score=quality_score,
            timestamp=timestamp,
            image_path=image_filename
        )

        logging.info(f"[SUCCESS] 측정 #{measurement_num}: {result.class_name} "
                     f"(신뢰도: {result.confidence:.3f}, 품질: {result.image_quality_score:.2f})")

        return result

    def perform_leaf_analysis_session(self) -> dict:
        """5회 연속 잎사진 분석 세션"""
        logging.info("\n========================================")
        logging.info("[SCHEDULER] ESP32-CAM 잎사진 분석 세션 시작")
        logging.info(f"[INFO] 시작 시간: {datetime.datetime.now()}")
        logging.info("========================================")

        # ESP32-CAM 연결 확인
        if not self.wait_for_esp32_ready():
            return {"status": "connection_failed", "results": []}

        # 5회 연속 측정 (3초 간격)
        measurement_results = []
        total_measurements = 5
        interval_seconds = 3

        for i in range(1, total_measurements + 1):
            result = self.perform_single_leaf_measurement(i)

            if result:
                measurement_results.append(result)

            # 마지막 측정이 아니면 대기
            if i < total_measurements:
                logging.info(f"[INFO] {interval_seconds}초 대기...")
                time.sleep(interval_seconds)

        # 5회 측정 결과 통계 분석
        session_summary = self.analyze_measurement_statistics(measurement_results)

        # 백엔드로 결과 전송 (기존 JSON 형식)
        self.send_to_backend(session_summary)

        # ESP32-CAM 딥슬립 모드 (1일간)
        sleep_duration = 1 * 24 * 60 * 60
        self.send_deep_sleep_command(sleep_duration)

        next_session = datetime.datetime.now() + datetime.timedelta(seconds=sleep_duration)
        logging.info(f"\n[INFO] ESP32-CAM 딥슬립 모드 시작 (1일간)")
        logging.info(f"[INFO] 다음 세션 예정: {next_session.strftime('%Y-%m-%d %H:%M')}")
        logging.info("========================================")

        return session_summary

    def analyze_measurement_statistics(self, results: List[LeafAnalysisResult]) -> dict:
        """5회 측정 결과 통계 분석"""
        if not results:
            return {
                "status": "session_failed",
                "message": "유효한 측정 결과 없음"
            }

        # 클래스별 신뢰도 집계
        class_confidence_sum = {}
        class_count = {}

        for result in results:
            class_name = result.class_name
            confidence = result.confidence

            if class_name not in class_confidence_sum:
                class_confidence_sum[class_name] = 0
                class_count[class_name] = 0

            class_confidence_sum[class_name] += confidence
            class_count[class_name] += 1

        # 최종 진단 결정 (신뢰도 총합이 가장 높은 클래스)
        best_class = max(class_confidence_sum, key=class_confidence_sum.get)
        final_confidence = class_confidence_sum[best_class] / class_count[best_class]
        detection_frequency = class_count[best_class] / len(results)

        # 품질 통계
        avg_quality = sum(r.image_quality_score for r in results) / len(results)

        session_summary = {
            "status": "success",
            "session_timestamp": datetime.datetime.now().isoformat(),
            "device_id": self.device_id,

            # 분석 결과
            "primary_diagnosis": best_class,
            "confidence": round(final_confidence, 3),
            "detection_frequency": round(detection_frequency, 2),

            # 세션 통계
            "total_measurements": len(results),
            "success_rate": len(results) / 5,
            "average_image_quality": round(avg_quality, 2),

            # 상세 결과
            "detailed_results": [
                {
                    "measurement": r.measurement_number,
                    "class": r.class_name,
                    "confidence": round(r.confidence, 3),
                    "quality": round(r.image_quality_score, 2),
                    "timestamp": r.timestamp.isoformat()
                }
                for r in results
            ]
        }

        logging.info(f"\n--- [AI] 세션 결과 요약 ---")
        logging.info(f"[SUCCESS] 최종 진단: {best_class}")
        logging.info(f"[SUCCESS] 신뢰도: {final_confidence:.3f}")
        logging.info(f"[SUCCESS] 탐지율: {detection_frequency:.1%}")
        logging.info(f"[SUCCESS] 평균 품질: {avg_quality:.2f}")

        return session_summary

    def send_to_backend(self, session_data: dict):
        """백엔드로 분석 결과 전송 (기존 JSON 형식 유지)"""
        try:
            # 기존 백엔드 API 형식에 맞춰 변환
            backend_payload = {
                "deviceId": self.device_id,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "detection": {
                    "className": session_data.get("primary_diagnosis", "unknown"),
                    "confidence": round(session_data.get("confidence", 0.0), 4)
                }
            }

            logging.info("[BACKEND] 백엔드로 결과 전송 중...")
            logging.info(f"[INFO] 전송 데이터: {json.dumps(backend_payload, indent=2)}")

            response = requests.post(
                self.backend_api_url,
                json=backend_payload,
                headers={'Content-Type': 'application/json'},
                timeout=15
            )

            if response.status_code == 200:
                logging.info("[SUCCESS] 백엔드 전송 성공")
            else:
                logging.warning(f"[WARNING] 백엔드 응답 오류: {response.status_code}")
                logging.warning(f"[WARNING] 응답 내용: {response.text}")

        except Exception as e:
            logging.error(f"[ERROR] 백엔드 전송 실패: {e}")

    def send_deep_sleep_command(self, duration_seconds: int):
        """ESP32-CAM 딥슬립 명령 전송"""
        try:
            payload = {
                "command": "deep_sleep",
                "duration": duration_seconds,
                "timestamp": datetime.datetime.now().isoformat()
            }

            logging.info(f"[INFO] ESP32-CAM 딥슬립 명령 전송 (지속시간: {duration_seconds}초)")

            response = requests.post(
                self.esp32_control_url,
                json=payload,
                timeout=5
            )

            if response.status_code == 200:
                logging.info("[SUCCESS] 딥슬립 명령 전송 성공")
            else:
                logging.warning(f"[WARNING] 딥슬립 명령 응답 오류: {response.status_code}")

        except Exception as e:
            logging.error(f"[ERROR] 딥슬립 명령 실패: {e}")

    def setup_simple_schedule(self, measurement_times: List[str]):
        """간단한 고정 스케줄 설정"""
        logging.info(f"[SCHEDULER] 잎사진 분석 스케줄 설정:")

        for time_slot in measurement_times:
            schedule.every().day.at(time_slot).do(self.perform_leaf_analysis_session)
            logging.info(f"[INFO] 매일 {time_slot}")


# --- 메인 실행 ---
if __name__ == "__main__":
    # 로그 디렉토리 생성
    if not os.path.exists('log'):
        os.makedirs('log')

    try:
        # ESP32-CAM 잎사진 분석 시스템 초기화
        leaf_analyzer = ESP32CamLeafAnalyzer('best.pt')
        logging.info("🍃 ESP32-CAM 잎사진 분석 시스템 초기화 완료")

        # 간단한 스케줄 설정 (예: 하루 2회)
        measurement_schedule = ["09:00", "15:00"]
        leaf_analyzer.setup_simple_schedule(measurement_schedule)

        logging.info("\n ESP32-CAM 잎사진 분석 시스템 시작!")
        logging.info(" 6개 클래스 잎 질병 진단 전문")
        logging.info(" 5회 측정 + 통계 분석으로 정확도 향상")
        logging.info(" 1일 주기 딥슬립으로 발열 방지")
        logging.info(" 기존 백엔드 API 완벽 호환")

        # 스케줄러 실행
        while True:
            schedule.run_pending()
            time.sleep(60)  # 1분마다 스케줄 확인

    except KeyboardInterrupt:
        logging.info("\n ESP32-CAM 잎사진 분석 시스템 종료")
    except Exception as e:
        logging.error(f" 시스템 오류: {e}")