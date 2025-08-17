<div align="center">
  <img src="./image/part/logo.png" width="130px" />
  <h1>🌿AI 기반 생육 진단과 디지털 트윈을 활용한 스마트팜 시스템🌿</h1>
  <img src="./image/part/smart.avif" width="800px" />
</div>


## 프로잭트 소개 - 25.07.18. - 25.08.25.
**Farm Link**는 실시간 환경 모니터링 센서와 AI 기반 생육 진단을 결합한 스마트팜 품질관리 시스템입니다.  
생육 환경을 자동 제어하고 작물 생장 예측 및 디지털 트윈 시각화를 통해 사용자에게 직관적인 품질관리 기능을 제공합니다.

- 이미지 기반 AI 분석으로 **생리 장애 및 병해 탐지**
- 환경 데이터 기반 **생장 예측**
- **Digital Twin (React, Unity WebGL)** 시각화를 통한 사용자 인터랙션 제공



### 👨‍👩‍👧‍👦 맴버 구성
- 팀장 : 오연희
- 팀원 : 김찬빈, 손승우, 양지은, 유지찬, 이용훈

### 📌 업무 분담
- 오연희 : AI
- 유지찬 : AI
- 김찬빈 : 프론트엔드
- 손승우 : 백엔드, 배포, unity
- 양지은 : 센서
- 이용훈 : PM
### 📌 환경
<div align="center">
  <img src="./image/part/part.png" width="800px" />
</div>

## 📌 주요 기능

### 🧠 **AI 생육 진단**
- 작물 이미지 분석을 통한 병해 탐지
- 생리 장애 조기 인지 및 사용자 알림 기능

### 🌡️ **환경 데이터 기반 제어**
- 센서 데이터를 실시간 수집 (온도, 습도, 조도, 토양 등)
- 임계치 기반 자동 제어 로직 적용

### 📊 **생장 예측 모델**
- 시간에 따른 생육 데이터 학습
- 작물 성장 상태 및 수확 시기 예측

### 🪞 **Digital Twin 시각화**
- Unity 기반 가상 농장 구현
- 현재 생육 상태 및 환경 정보 시각화

## Architecture
<img src="./image/SystemArchitecture/newSystemArchitecture.png" width="500px" />

## Backend
### ERD
<img src="./image/ERD/ERD.ver250812.png" width="500px" />


```markdown
```mermaid
classDiagram
    direction LR

    %% ========== DOMAIN ==========
    class Member {
        Long id
        String login
        String password
        String name
        String phoneNumber
        Address address
        List~Shelf~ farmShelves
    }
    class Address {
        String city
        String street
        String zipcode
    }
    class Image {
        Long id
        String imageUrl
        Member member
    }
    class Shelf {
        Long id
        Member member
        Integer position
        List~ShelfFloor~ shelfFloors
    }
    class ShelfFloor {
        Long id
        Shelf shelf
        Integer position
        List~Pot~ pots
    }
    class Pot {
        Long id
        ShelfFloor shelfFloor
        Integer position
        double ph
        double temperature
        double lightStrength
        double ttsDensity
        double humidity
        double exp
        Plant potPlant
        PotStatus status
    }
    enum Plant {
        SPROUT, FLOWER, FRUIT, COMPLETE, EMPTY
    }
    enum PotStatus {
        NORMAL, WARNING, EMPTY, GRAYMOLD, POWDERYMILDEW, NITROGENDEFICIENCY, PHOSPHROUSDEFICIENCY, POTASSIUMDEFICIENCY
    }

    %% ========== DTO ==========
    class DiagnosisRequest
    class PotDto
    class PotPositionRequest
    class MemberJoinRequestDto
    class MemberResponseDto
    class ProfileUpdateRequest
    class ImageUploadResponseDto

    %% ========== REPOSITORY ==========
    class MemberRepository
    class PotRepository
    class ImageRepository
    class ShelfRepository
    class ShelfFloorRepository

    %% ========== SERVICE ==========
    class FarmService
    class LoginService
    class MemberService
    class DiagnosisService
    class SensorService
    class ImageService

    %% ========== CONTROLLER ==========
    class FarmController
    class LoginController
    class DiagnosisController
    class ImageController

    %% ========== MQTT ==========
    class MqttListener
    class MqttPublisher

    %% ========== SCHEDULER ==========
    class GrowthScheduler

    %% ========== RELATIONS ==========
    Member "1" --> "many" Shelf : has
    Shelf "1" --> "many" ShelfFloor : has
    ShelfFloor "1" --> "many" Pot : has
    Member "1" --> "1" Image
    Pot "*" --> "1" ShelfFloor

    %% Repositories
    MemberRepository --> Member
    PotRepository --> Pot
    ImageRepository --> Image
    ShelfRepository --> Shelf
    ShelfFloorRepository --> ShelfFloor

    %% Services
    FarmService --> MemberRepository
    FarmService --> PotRepository
    LoginService --> MemberRepository
    MemberService --> MemberRepository
    DiagnosisService --> PotRepository
    SensorService --> PotRepository
    ImageService --> ImageRepository

    %% Controllers
    FarmController --> FarmService
    LoginController --> LoginService
    LoginController --> MemberService
    DiagnosisController --> DiagnosisService
    ImageController --> ImageService

    %% MQTT & Scheduler
    MqttListener --> SensorService
    MqttPublisher --> (publishes)
    GrowthScheduler --> PotRepository
