import cv2
from ultralytics import YOLO
import time

# 1. 모델 로드
try:
    model = YOLO('best.pt')
    print("YOLOv8 모델을 성공적으로 로드했습니다.")
except Exception as e:
    print(f"모델 로드 중 오류 발생: {e}")
    exit()

# 2. ESP32-CAM 스트리밍 주소 설정 (본인 주소로 설정)
stream_url = 'http://10.145.189.86:81/stream'

# 3. 영상 스트림 받아오기
cap = cv2.VideoCapture(stream_url)

if not cap.isOpened():
    print(f"오류: 영상 스트림을 열 수 없습니다. URL 주소를 확인하세요: {stream_url}")
    exit()
else:
    print("스트림에 연결되었습니다. 잠시 후 사진을 한 장 촬영합니다...")

# 스트림이 안정화될 시간을 잠시 줍니다. (선택 사항이지만 권장)
time.sleep(2)

# 4. 스트림에서 이미지 한 장만 읽어오기
ret, frame = cap.read()

# 5. 이미지를 성공적으로 읽었는지 확인
if ret:
    print("사진 촬영 성공! 분석을 시작합니다...")

    # YOLOv8 모델로 촬영된 이미지 추론
    results = model(frame)

    # 6. 결과 시각화 및 출력
    for r in results:
        # 이미지에 바운딩 박스와 라벨을 그려줌
        annotated_frame = r.plot()

        # 'Analysis Result' 라는 이름의 창에 결과 이미지 보여주기
        cv2.imshow('Analysis Result', annotated_frame)

        # --- 터미널에 텍스트로 결과 출력 ---
        print("\n--- 분석 결과 ---")
        if not r.boxes:
            print("탐지된 객체가 없습니다.")
        else:
            # 탐지된 모든 객체에 대해 반복
            for box in r.boxes:
                class_id = int(box.cls[0])
                class_name = model.names[class_id]
                confidence = float(box.conf[0])
                print(f"✅ 진단명: {class_name}, 신뢰도: {confidence:.2f}")
        print("-----------------\n")

    print("결과 창이 나타났습니다. 창을 클릭하고 아무 키나 누르면 프로그램이 종료됩니다.")
    # 사용자가 키를 누를 때까지 창을 계속 열어둠
    cv2.waitKey(0)

else:
    print("오류: 스트림에서 프레임을 읽어올 수 없습니다.")

# 7. 자원 해제
cap.release()
cv2.destroyAllWindows()
print("프로그램을 종료합니다.")