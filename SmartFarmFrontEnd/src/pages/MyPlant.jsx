// src/pages/MyPlant.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Bar from "../components/Bar";
import "../components/Bar.css";
import "../App.css"; // 스타일 포함
import { getWeatherData } from "../api/weather";
import { getSeedlings } from "../api/farm";
import "../components/WeatherModern.css";

function MyPlant() {
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const shelf = queryParams.get("shelf");
  const row = queryParams.get("row");
  const col = queryParams.get("col");

  const [plantData, setPlantData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchPlantData = async () => {
      try {
        const seedlingsData = await getSeedlings();
        // 현재 선반,줄,칸에 해당하는 식물 찾기
        const currentPlant = seedlingsData.seedlings.find(
          (seedling) =>
            seedling.shelfPosition === parseInt(shelf) &&
            seedling.floorPosition === parseInt(row) &&
            seedling.potPosition === parseInt(col)
        );

        if (currentPlant) {
          // 기존 센서 데이터와 성장/상태 정보를 결합
          setPlantData({
            temperature: currentPlant.temperature || 24.5,
            humidity: currentPlant.humidity || 65,
            light: currentPlant.light || 540,
            ph: currentPlant.ph || 6.3,
            tds: currentPlant.tds || 720,
            growth: currentPlant.growthStage || "SPROUT", // 성장단계
            condition: currentPlant.condition || "NORMAL", // 상태
            status: currentPlant.status || "NORMAL",
          });
        }
      } catch (err) {
        console.error("식물 데이터 로드 실패:", err);
      }
    };

    fetchPlantData();

    // 날씨 데이터 가져오기 (예시 좌표: 서울)
    const fetchWeatherData = async () => {
      try {
        // 서울 좌표 직접 사용
        const weatherObj = await getWeatherData(37.5665, 126.978);
        setWeatherData(weatherObj);
      } catch (err) {
        console.error("날씨 데이터 로드 실패:", err);
      }
    };

    fetchWeatherData();

    // Mock 데이터
    const mockData = {
      temperature: 17.5,
      humidity: 80,
      light: 540,
      ph: 10.3,
      tds: 720,
      status: "NORMAL",
      growth: "FRUIT", // SPROUT, FLOWER, FRUIT, COMPLETE
      condition: "WARNING", // NORMAL, WARNING, CRITICAL
    };
    setPlantData(mockData);

    const mockSchedules = [
      { date: "2025-08-10", event: t("schedule.harvest") },
      { date: "2025-08-15", event: t("schedule.fertilizer") },
    ];
    setSchedules(mockSchedules);
  }, [shelf, row, col, t]);

  // 날씨 상태 텍스트를 번역 키로 매핑하는 함수
  const getWeatherConditionKey = (text) => {
    if (!text) return "";

    // 텍스트를 표준화된 형식으로 변환
    const normalizedText = text.toLowerCase().trim();

    const map = {
      sunny: "sunny",
      clear: "clear",
      "partly cloudy": "partlycloudy",
      cloudy: "cloudy",
      overcast: "overcast",
      rain: "rain",
      "light rain": "lightrain",
      "moderate rain": "rain",
      "heavy rain": "heavyrain",
      showers: "showers",
      snow: "snow",
      "light snow": "lightsnow",
      "patchy light snow": "lightsnow",
      "moderate snow": "snow",
      "heavy snow": "heavysnow",
      sleet: "sleet",
      fog: "fog",
      mist: "mist",
      thunder: "thunder",
      "thundery outbreaks": "thunder",
      "thunder/lightning": "thunder",
    };
    const mappedCondition =
      map[normalizedText] || normalizedText.replace(/\s+/g, "");
    return "weather.condition." + mappedCondition;
  };

  // 성장 단계와 상태에 따른 이미지 매핑
  const getPlantImage = (growth, condition) => {
    const imageMap = {
      SPROUT: {
        NORMAL: "/sprout_normal.png",
        WARNING: "/sprout_warning.png",
        CRITICAL: "/sprout_critical.png",
      },
      FLOWER: {
        NORMAL: "/flower_normal.png",
        WARNING: "/flower_warning.png",
        CRITICAL: "/flower_critical.png",
      },
      FRUIT: {
        NORMAL: "/fruit_normal.png",
        WARNING: "/fruit_warning.png",
        CRITICAL: "/fruit_critical.png",
      },
      COMPLETE: {
        NORMAL: "/fruit_normal.png",
        WARNING: "/fruit_warning.png",
        CRITICAL: "/fruit_critical.png",
      },
    };

    return imageMap[growth]?.[condition] || "/sprout_normal.png";
  };

  // 성장 단계 텍스트 변환
  const getGrowthStageText = (growth) => {
    const stageMap = {
      SPROUT: "새싹 단계",
      FLOWER: "개화 단계",
      FRUIT: "결실 단계",
      COMPLETE: "수확 단계",
    };
    return stageMap[growth] || "새싹 단계";
  };

  // 상태 텍스트 변환
  const getConditionText = (condition) => {
    const conditionMap = {
      NORMAL: "정상 상태입니다",
      WARNING: "주의가 필요합니다",
      CRITICAL: "위험 상태입니다",
    };
    return conditionMap[condition] || "정상 상태입니다";
  };

  return (
    <>
      <div className="myplant-container plant-bg">
        <div className="myplant-header">
          {t("myplant.title")}🌿
          <p className="myplant-subtext">{t("myplant.subtitle")}</p>
        </div>

        <button className="back-btn" onClick={() => navigate(-1)}>
          ← {t("button.back")}
        </button>

        {plantData && (
          <div className="plant-info-box">
            <div className="plant-left">
              <img
                src={getPlantImage(plantData.growth, plantData.condition)}
                alt={t("alt.tomato")}
                className="plant-large-img"
              />
              <div className="plant-name">{t("plant.tomato")}</div>
              <div className="plant-stage">
                {getGrowthStageText(plantData.growth)}
              </div>
            </div>

            <div className="plant-right">
              <div className="sensor-weather-row">
                <div className="sensor-bars">
                  <Bar
                    label={t("sensor.temperature")}
                    value={plantData.temperature}
                    min={0}
                    max={50}
                    unit="°C"
                    icon="🌡️"
                  />
                  <Bar
                    label={t("sensor.humidity")}
                    value={plantData.humidity}
                    min={0}
                    max={100}
                    unit="%"
                    icon="💧"
                  />
                  <Bar
                    label={t("sensor.light")}
                    value={plantData.light}
                    min={0}
                    max={1000}
                    unit=""
                    icon="💡"
                  />
                  <Bar
                    label={t("sensor.ph")}
                    value={plantData.ph}
                    min={0}
                    max={14}
                    unit=""
                    icon="🧪"
                  />
                  <Bar
                    label={t("sensor.tds")}
                    value={plantData.tds}
                    min={0}
                    max={2000}
                    unit="ppm"
                    icon="🧂"
                  />
                </div>
                <div className="weather-modern-card">
                  <div className="weather-modern-header">
                    <span className="weather-modern-icon">🌤️</span>
                    <span className="weather-modern-title">
                      {t("weather.today")}
                    </span>
                  </div>
                  <div className="weather-modern-content">
                    {weatherData ? (
                      <>
                        <div className="weather-modern-row">
                          <span className="weather-modern-label">
                            🌡️ {t("weather.temp")}
                          </span>
                          <span className="weather-modern-value">
                            {weatherData.temp}°C
                          </span>
                        </div>
                        <div className="weather-modern-row">
                          <span className="weather-modern-label">
                            💧 {t("weather.humidity")}
                          </span>
                          <span className="weather-modern-value">
                            {weatherData.humidity}%
                          </span>
                        </div>
                        <div className="weather-modern-row">
                          <span className="weather-modern-label">
                            ☀️ {t("weather.condition")}
                          </span>
                          <span className="weather-modern-value">
                            {t(getWeatherConditionKey(weatherData.condition))}
                          </span>
                        </div>
                        <div className="weather-modern-row">
                          <span className="weather-modern-label">
                            🌬️ {t("weather.wind")}
                          </span>
                          <span className="weather-modern-value">
                            {weatherData.wind} m/s
                          </span>
                        </div>
                        <div className="weather-modern-row">
                          <span className="weather-modern-label">
                            🌡️ {t("weather.feelsLike")}
                          </span>
                          <span className="weather-modern-value">
                            {weatherData.feelsLike}°C
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="weather-modern-row weather-loading">
                        {t("weather.loading")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="button-group">
                <div
                  className={`status-label ${plantData.condition.toLowerCase()}`}
                >
                  {getConditionText(plantData.condition)}
                </div>
                <button
                  className="calendar-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  📅 {t("button.schedule")}
                </button>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="calendar-modal">
            <div className="calendar-content">
              <button
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✖
              </button>

              <Calendar
                value={value}
                onChange={setValue}
                className="custom-calendar"
                locale={t("calendar.locale")}
                formatDay={(locale, date) => date.getDate()}
                calendarType="gregory"
              />

              <ul className="event-list">
                {schedules.map((item, idx) => (
                  <li key={idx}>
                    📅 {item.date} - {item.event}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정 Footer */}
      <p className="footer-info">
        SmartFarm {t("footer.systemName")} v1.0.0 &nbsp;|&nbsp; © 2025 FarmLink
        Team
      </p>
    </>
  );
}

export default MyPlant;
