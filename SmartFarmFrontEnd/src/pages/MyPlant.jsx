// src/pages/MyPlant.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "i18next"; // i18n import 추가
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Bar from "../components/Bar";
import "../components/Bar.css";
import "../App.css"; // 스타일 포함
import { getWeatherData } from "../api/weather";
import { getSeedlings } from "../api/farm";
import "../components/WeatherModern.css";

// ✅ 폴링 간격(ms)
const POLL_MS = 3000; // 필요에 따라 1000~5000 사이로 조절

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

  // 숫자형 좌표 캐시 (폴링에서도 재사용)
  const shelfNum = Number.parseInt(shelf ?? "", 10);
  const rowNum = Number.parseInt(row ?? "", 10);
  const colNum = Number.parseInt(col ?? "", 10);

  useEffect(() => {
    const fetchPlantData = async () => {
      try {
        const seedlingsData = await getSeedlings();
        console.log("받아온 전체 데이터:", seedlingsData);

        console.log("찾고있는 위치:", { shelfNum, rowNum, colNum });

        const currentPlant = seedlingsData.find((seedling) => {
          console.log("비교중인 식물:", JSON.stringify(seedling, null, 2));
          return (
            seedling.position?.numOfShelf === shelfNum &&
            seedling.position?.numOfShelfFloor === rowNum &&
            seedling.position?.numOfPot === colNum
          );
        });

        console.log("찾은 식물:", currentPlant);

        if (currentPlant) {
          setPlantData({
            temperature: currentPlant.temperature || 24.5,
            humidity: currentPlant.humidity || 0,
            light: currentPlant.lightStrength || 540,
            ph: currentPlant.ph || 6.3,
            tds: currentPlant.tds ?? currentPlant.ttsDensity ?? 720,
            growth: currentPlant.plant || "SPROUT",
            condition: currentPlant.status || "NORMAL",
            status: currentPlant.status || "NORMAL",
          });
        } else {
          console.log("해당 위치에 식물을 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("식물 데이터 로드 실패:", err);
      }
    };

    fetchPlantData();

    // 날씨 데이터 가져오기 (예시 좌표: 서울)
    const fetchWeatherData = async () => {
      try {
        const weatherObj = await getWeatherData(37.5665, 126.978);
        console.log("날씨 데이터:", weatherObj); // 디버깅용
        setWeatherData(weatherObj);
      } catch (err) {
        console.error("날씨 데이터 로드 실패:", err);
      }
    };

    fetchWeatherData();

    // 일정 데이터 예시 (실제 API 호출로 대체 필요)
    const mockSchedules = [
      { date: "2025-08-10", event: t("schedule.harvest") },
      { date: "2025-08-15", event: t("schedule.fertilizer") },
    ];
    setSchedules(mockSchedules);
  }, [shelfNum, rowNum, colNum, t]);

  // ✅ 최소 변경: 폴링으로 currentPlant 갱신
  useEffect(() => {
    let timerId;
    let aborted = false;
    let backoff = 0; // 에러 시 간단 백오프(최대 10초)

    async function tick() {
      try {
        if (aborted) return;

        const seedlingsData = await getSeedlings();
        if (aborted) return;

        const currentPlant = seedlingsData.find((seedling) => {
          const p = seedling.position || {};
          return (
            Number(p.numOfShelf) === shelfNum &&
            Number(p.numOfShelfFloor) === rowNum &&
            Number(p.numOfPot) === colNum
          );
        });

        if (currentPlant) {
          setPlantData((prev) => {
            const next = {
              temperature: currentPlant.temperature ?? prev?.temperature ?? 24.5,
              humidity: currentPlant.humidity ?? prev?.humidity ?? 0,
              light: currentPlant.lightStrength ?? prev?.light ?? 540,
              ph: currentPlant.ph ?? prev?.ph ?? 6.3,
              tds:
                (currentPlant.tds ?? currentPlant.ttsDensity) ??
                prev?.tds ??
                720,
              growth: currentPlant.plant ?? prev?.growth ?? "SPROUT",
              condition: currentPlant.status ?? prev?.condition ?? "NORMAL",
              status: currentPlant.status ?? prev?.status ?? "NORMAL",
            };

            // 얕은 비교로 변화 없으면 리렌더 스킵
            if (
              prev &&
              next.temperature === prev.temperature &&
              next.humidity === prev.humidity &&
              next.light === prev.light &&
              next.ph === prev.ph &&
              next.tds === prev.tds &&
              next.growth === prev.growth &&
              next.condition === prev.condition &&
              next.status === prev.status
            ) {
              return prev;
            }
            return next;
          });
        }

        backoff = 0; // 성공 시 백오프 초기화
      } catch (e) {
        console.error("Polling error:", e);
        backoff = Math.min((backoff || 1000) * 2, 10000);
      } finally {
        if (!aborted) {
          const delay = backoff ? backoff : POLL_MS;
          timerId = window.setTimeout(tick, delay);
        }
      }
    }

    // 탭이 보일 때 즉시 한 번 갱신(선택)
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        clearTimeout(timerId);
        tick();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 시작 즉시 1회 실행 + 주기 반복
    tick();

    return () => {
      aborted = true;
      clearTimeout(timerId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [shelfNum, rowNum, colNum]);

  // 날씨 상태 텍스트 변환 함수
  const getWeatherText = (text) => {
    if (!text) return "";
    console.log("받은 날씨 상태:", text); // 디버깅용

    const weatherMap = {
      Clear: "맑음",
      Sunny: "맑음",
      "Partly cloudy": "구름 조금",
      Cloudy: "흐림",
      Overcast: "매우 흐림",
      Mist: "박무",
      "Patchy rain nearby": "근처에 비",
      "Patchy snow nearby": "근처에 눈",
      "Patchy sleet nearby": "근처에 진눈깨비",
      "Light rain": "약한 비",
      "Moderate rain": "보통 비",
      "Heavy rain": "강한 비",
      "Light snow": "약한 눈",
      "Moderate snow": "보통 눈",
      "Heavy snow": "강한 눈",
    };

    // i18n.language로 현재 언어 확인
    return i18n.language === "ko" ? weatherMap[text] || text : text;
  };

  // 성장 단계 텍스트 변환
  const getGrowthStageText = (growth) => {
    const stageMap = {
      SPROUT: "growth.stage.sprout",
      FLOWER: "growth.stage.flower",
      FRUIT: "growth.stage.fruit",
      COMPLETE: "growth.stage.complete",
    };
    return t(stageMap[growth] || "growth.stage.sprout");
  };

  // 상태 텍스트 변환
  const getConditionText = (condition) => {
    const conditionMap = {
      NORMAL: "plant.condition.normal",
      WARNING: "plant.condition.warning",
      EMPTY: "plant.condition.empty",
      GRAYMOLD: "plant.condition.graymold",
      POWDERYMILDEW: "plant.condition.powderymildew",
      NITROGENDEFICIENCY: "plant.condition.nitrogen",
      PHOSPHROUSDEFICIENCY: "plant.condition.phosphrous",
      POTASSIUMDEFICIENCY: "plant.condition.potassium",
    };
    return t(conditionMap[condition] || "plant.condition.normal");
  };

  // 성장 단계와 상태에 따른 이미지 매핑
  const getPlantImage = (growth, condition) => {
    // 기본 상태별 이미지 매핑
    const baseImageMap = {
      NORMAL: "_NORMAL.png",
      WARNING: "_WARNING.png",
      GRAYMOLD: "_GRAYMOLD.png",
      POWDERYMILDEW: "_POWDERYMILDEW.png",
      NITROGENDEFICIENCY: "_NITROGENDEFICIENCY.png",
      PHOSPHROUSDEFICIENCY: "_PHOSPHROUSDEFICIENCY.png",
      POTASSIUMDEFICIENCY: "_POTASSIUMDEFICIENCY.png",
    };

    // 성장 단계별 기본 이미지 경로
    const growthPrefix = {
      SPROUT: "/sprout",
      FLOWER: "/flower",
      FRUIT: "/fruit",
      COMPLETE: "/complete", // 완성 단계는 fruit 이미지 사용
    };

    if (condition === "EMPTY") {
      return "/empty.png";
    }

    const prefix = growthPrefix[growth] || "/sprout";
    const suffix = baseImageMap[condition] || "_NORMAL.png";
    return prefix + suffix;
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
                    max={4095}
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
                      {t("todaysWeather")}
                    </span>
                  </div>
                  <div className="weather-modern-content">
                    {weatherData ? (
                      <>
                        <div className="weather-modern-row">
                          <span className="weather-modern-label">
                            🌡️ {t("temperature")}
                          </span>
                          <span className="weather-modern-value">
                            {weatherData.temp}°C
                          </span>
                        </div>
                        <div className="weather-modern-row">
                          <span className="weather-modern-label">
                            💧 {t("humidity")}
                          </span>
                          <span className="weather-modern-value">
                            {weatherData.humidity}%
                          </span>
                        </div>
                        <div className="weather-modern-row">
                          <span className="weather-modern-label">
                            ☀️ {t("condition")}
                          </span>
                          <span className="weather-modern-value">
                            {getWeatherText(weatherData.condition)}
                          </span>
                        </div>
                        <div className="weather-modern-row">
                          <span className="weather-modern-label">
                            🌬️ {t("windSpeed")}
                          </span>
                          <span className="weather-modern-value">
                            {weatherData.wind} m/s
                          </span>
                        </div>
                        <div className="weather-modern-row">
                          <span className="weather-modern-label">
                            🌡️ {t("feelsLike")}
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
