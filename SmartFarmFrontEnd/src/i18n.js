// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  debug: true,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    ko: {
      translation: {
        welcome: "환영합니다",
        logout: "로그아웃",
        login: "로그인",
        myFarm: "내 농장",
        myPage: "내 페이지",
        moisture: "토마토와 상추가 수분이 부족합니다.",
        harvest: "시금치와 무가 수확 준비가 되었습니다!",
        siteExplain:
          "이 사이트는 스마트팜 관리 시스템으로, 실시간 센서 데이터와 재배 일정을 편리하게 확인할 수 있습니다.",
        siteExplainBtn: "#사이트 설명해줘",
        default:
          "챗봇 기능은 아직 준비 중입니다. 추천 질문 중 하나를 눌러보세요!",
        "typing.question1": "오늘 상추 상태는 어때?",
        "typing.question2": "토마토 수확은 언제쯤 가능해?",
        "alt.background": "배경 이미지",
        "alt.bee": "꿀벌 이미지",
        "alt.search": "검색 아이콘",
        "placeholder.search": "검색",
        "question.moisture": "# 수분량 부족한 작물은?",
        "question.harvest": "# 수확 가능한 작물은?",
        "warn.invalidIndex": "잘못된 인덱스",
        //-------------------------------------------------------------------------
        "error.fetchSeedlingsFail": "세싹 불러오기 실패",
        "error.logoutFail": "로그아웃 실패",
        "error.sendSeedlingFail": "백엔드 전송 실패",
        "myfarm.instruction":
          "선반에 세싹을 추가해 나만의 스마트팜을 시작해보세요 🌱",
        "myfarm.addOne": "+ 하나 추가",
        "myfarm.addLine": "+ 줄 추가",
        "myfarm.addAll": "+ 전체 추가",
        "myfarm.hintPart1": "세싹을 심고 관리하려면",
        "myfarm.hintPart2": "를 눌러보세요 🌿",
        "alt.shelf": "선반 이미지",
        "alt.plantNormal": "정상 작물",
        //-------------------------------------------------------------------------
        "error.userLoadFail": "사용자 정보 불러오기 실패",
        "error.imageLoadFail": "프로필 이미지 불러오기 실패",
        "error.imageUploadFail": "이미지 업로드 실패",
        "button.back": "뒤로가기",
        "mypage.title": "MY PAGE",
        "mypage.editProfile": "Edit Profile",
        "mypage.greeting1": "반가워요,",
        "mypage.defaultName": "농부",
        "mypage.greeting2": "님!",
        "mypage.greeting3": "아래에서 회원 정보를 확인하거나 수정할 수 있어요.",
        "mypage.farmerProfile": "FARMER’s PROFILE",
        "mypage.imagePlaceholderText": "사진 선택",
        "mypage.clickToUpload": "클릭하여 업로드",
        "alt.profileImage": "프로필 이미지",
        "mypage.nameLabel": "name",
        "mypage.numberLabel": "number",
        "mypage.locationLabel": "location",
        "mypage.noLocationWarning": "농장 위치를 아직 등록하지 않았어요.",
        "mypage.alertSettings": "Alert Settings",
        "mypage.notifyMessage": "Notify me when an issue is detected",
        "mypage.deleteWarning":
          "계정을 삭제하면 모든 정보가 사라지며 복구가 불가능합니다.",
        "mypage.deleteAccount": "❗ Delete Account",
        "mypage.systemVersion": "시스템",
        //-------------------------------------------------------------------------
        "myplant.title": "My Plant",
        "myplant.subtitle":
          "현재 식물의 상태와 센서 데이터를 한눈에 확인해보세요.",
        "button.schedule": "재배일정",
        "plant.tomato": "토마토",
        "plant.stage": "성장 단계",
        "plant.statusNormal": "적정 상태입니다",
        "sensor.temperature": "Temperature",
        "sensor.humidity": "Humidity",
        "sensor.light": "Light",
        "sensor.ph": "pH",
        "sensor.tds": "TDS",
        "schedule.harvest": "수확 예정일",
        "schedule.fertilizer": "비료 주기",
        "alt.tomato": "토마토",
        "calendar.locale": "ko-KR",
        "footer.systemName": "시스템",
        //------------------------------------------------------------------------- tutorial
        "myfarm.tour.step1": "세싹을 하나씩 추가할 수 있어요!",
        "myfarm.tour.step2": "한 줄(5개)씩 추가할 수 있어요!",
        "myfarm.tour.step3": "전체 선반을 한 번에 채울 수도 있어요!",
        "myfarm.tour.step4": "이건 실제 선반이에요. 세싹들이 여기에 자라요.",
        "myfarm.tour.step5":
          "비어 있는 화분에 + 버튼을 눌러 세싹을 심어보세요!",
        "myfarm.tour.step6": "세싹을 클릭하면 상태를 자세히 확인할 수 있어요.",
        "myfarm.tour.step7": "여기 X 버튼을 누르면 세싹을 삭제할 수 있어요.",
        // 필요한 번역 키 추가
        // 날씨 관련 키 수정
        todaysWeather: "오늘의 날씨",
        temperature: "기온",
        humidity: "습도",
        condition: "날씨",
        windSpeed: "풍속",
        feelsLike: "체감온도",
        "weather.cloudy": "흐림",
        "weather.rain": "비",
        "weather.patchyrain": "가끔 비",
        //-------------------------------------------------------------------------
        // 성장 단계
        "growth.stage.sprout": "새싹 단계",
        "growth.stage.flower": "개화 단계",
        "growth.stage.fruit": "결실 단계",
        "growth.stage.complete": "수확 단계",

        // 식물 상태
        "plant.condition.normal": "정상 상태입니다",
        "plant.condition.warning": "주의가 필요합니다",
        "plant.condition.empty": "비어있음",
        "plant.condition.graymold": "잿빛곰팡이병 감염",
        "plant.condition.powderymildew": "흰가루병 감염",
        "plant.condition.nitrogen": "질소 결핍",
        "plant.condition.phosphrous": "인 결핍",
        "plant.condition.potassium": "칼륨 결핍",


        // 날씨 상태
        "weather.condition.patchyrainnearby": "근처에 비",

        plantTwin: "Plant Twin🌱",
        plantTwinDesc: "3D Plant Twin에서 내 스마트팜의 상태를 실시간으로 확인하고 다양한 시각화 기능을 체험해보세요.",
      },
    },
    en: {
      translation: {
        welcome: "Welcome",
        logout: "LOG OUT",
        login: "LOG IN",
        myFarm: "My Farm",
        myPage: "My Page",
        moisture: "Tomato and lettuce are lacking moisture.",
        harvest: "Spinach and radish are ready for harvest!",
        siteExplain:
          "This site is a smart farm management system where you can conveniently check real-time sensor data and cultivation schedules.",
        siteExplainBtn: "#Explain the site",
        default:
          "Chatbot feature is still under preparation. Please try one of the recommended questions!",
        "typing.question1": "How is the lettuce condition today?",
        "typing.question2": "When can we harvest the tomatoes?",
        "alt.background": "Background image",
        "alt.bee": "Bee image",
        "alt.search": "Search icon",
        "placeholder.search": "Search",
        "question.moisture": "# Which crops are lacking moisture?",
        "question.harvest": "# Which crops are ready for harvest?",
        "warn.invalidIndex": "Invalid index",
        //-------------------------------------------------------------------------
        "error.fetchSeedlingsFail": "Failed to fetch seedlings",
        "error.logoutFail": "Logout failed",
        "error.sendSeedlingFail": "Failed to send to backend",
        "myfarm.instruction":
          "Add seedlings to shelves and start your smart farm 🌱",
        "myfarm.addOne": "+ Add One",
        "myfarm.addLine": "+ Add Line",
        "myfarm.addAll": "+ Add All",
        "myfarm.hintPart1": "To plant and manage seedlings, press",
        "myfarm.hintPart2": "",
        "alt.shelf": "Shelf image",
        "alt.plantNormal": "Normal plant",
        //-------------------------------------------------------------------------
        "error.userLoadFail": "Failed to load user information",
        "error.imageLoadFail": "Failed to load profile image",
        "error.imageUploadFail": "Image upload failed",
        "button.back": "Back",
        "mypage.title": "MY PAGE",
        "mypage.editProfile": "Edit Profile",
        "mypage.greeting1": "Welcome,",
        "mypage.defaultName": "Farmer",
        "mypage.greeting2": "!",
        "mypage.greeting3":
          "You can check or edit your profile information below.",
        "mypage.farmerProfile": "FARMER’s PROFILE",
        "mypage.imagePlaceholderText": "Select Photo",
        "mypage.clickToUpload": "Click to upload",
        "alt.profileImage": "Profile Image",
        "mypage.nameLabel": "Name",
        "mypage.numberLabel": "Number",
        "mypage.locationLabel": "Location",
        "mypage.noLocationWarning": "Farm location is not registered yet.",
        "mypage.alertSettings": "Alert Settings",
        "mypage.notifyMessage": "Notify me when an issue is detected",
        "mypage.deleteWarning":
          "If you delete the account, all data will be lost and cannot be restored.",
        "mypage.deleteAccount": "❗ Delete Account",
        "mypage.systemVersion": "System",
        //-------------------------------------------------------------------------
        "myplant.title": "My Plant",
        "myplant.subtitle":
          "Check your plant's status and sensor data at a glance.",
        "button.schedule": "Schedule",
        "plant.tomato": "Tomato",
        "plant.stage": "Growth Stage",
        "plant.statusNormal": "Optimal condition",
        "sensor.temperature": "Temperature",
        "sensor.humidity": "Humidity",
        "sensor.light": "Light",
        "sensor.ph": "pH",
        "sensor.tds": "TDS",
        "schedule.harvest": "Expected Harvest",
        "schedule.fertilizer": "Fertilizing",
        "alt.tomato": "Tomato",
        "calendar.locale": "en-US",
        "footer.systemName": "System",
        //------------------------------------------------------------------------- tutorial
        "myfarm.tour.step1": "You can add one seedling at a time!",
        "myfarm.tour.step2": "You can add a full row of 5 seedlings!",
        "myfarm.tour.step3": "You can even fill the entire shelf at once!",
        "myfarm.tour.step4": "This is the shelf where your seedlings grow.",
        "myfarm.tour.step5": "Click the + button on an empty pot to plant!",
        "myfarm.tour.step6": "Click a seedling to view its status in detail.",
        "myfarm.tour.step7": "Click the X button to remove the seedling.",
        //-------------------------------------------------------------------------
        // Growth stages
        "growth.stage.sprout": "Sprout Stage",
        "growth.stage.flower": "Flowering Stage",
        "growth.stage.fruit": "Fruiting Stage",
        "growth.stage.complete": "Harvest Stage",

        // Plant conditions
        "plant.condition.normal": "Normal Condition",
        "plant.condition.warning": "Needs Attention",
        "plant.condition.empty": "Empty",
        "plant.condition.graymold": "Gray Mold Infection",
        "plant.condition.powderymildew": "Powdery Mildew Infection",
        "plant.condition.nitrogen": "Nitrogen Deficiency",
        "plant.condition.phosphrous": "Phosphrous Deficiency",
        "plant.condition.potassium": "Potassium Deficiency",

        // Weather conditions
        "weather.condition.patchyrainnearby": "Patchy Rain Nearby",

        plantTwin: "Plant Twin🌱",
        plantTwinDesc: "Check your smart farm status in real time and experience various visualization features in the 3D Plant Twin.",
      },
    },
  },
});

export default i18n;
