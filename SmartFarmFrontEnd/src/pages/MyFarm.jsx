// src/pages/MyFarm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Joyride from "react-joyride";
import Header from "../components/Header";
import { addSeedling, getSeedlings, deleteSeedling } from "../api/farm";
import { getCurrentUser } from "../api/auth";
import CustomBeacon from "../components/CustomBeacon";
import "../App.css";

const ROWS_PER_SHELF = 4;
const COLS_PER_ROW = 5;
const MAX_POTS = ROWS_PER_SHELF * COLS_PER_ROW; // 20

function createEmptyShelf() {
  return Array.from({ length: ROWS_PER_SHELF }, () =>
    Array(COLS_PER_ROW).fill(null)
  );
}

// 유틸: 현재 0번 선반에 심어진 화분 개수
function countPlantsInShelf(shelf) {
  return shelf.flat().filter(Boolean).length;
}

function MyFarm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  // 항상 선반 1개만 유지
  const [shelves, setShelves] = useState([createEmptyShelf()]);
  const [runTutorial, setRunTutorial] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        const key = user?.phoneNumber || "guest";
        setUserId(key);
      } catch {
        console.warn("서버에서 사용자 정보를 불러올 수 없습니다. 게스트로 진행합니다.");
        setUserId("guest");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      const hasSeen = localStorage.getItem(`hasSeenFarmTour_${userId}`);
      setRunTutorial(hasSeen !== "true");
    }
  }, [userId]);

  const steps = [
    { target: ".add-btn:nth-child(1)", content: t("myfarm.tour.step1"), customProps: { style: { marginTop: "30px", marginLeft: "-15px" } } },
    { target: ".add-btn:nth-child(2)", content: t("myfarm.tour.step2"), customProps: { style: { marginTop: "30px", marginLeft: "-15px" } } },
    { target: ".add-btn:nth-child(3)", content: t("myfarm.tour.step3"), customProps: { style: { marginTop: "30px", marginLeft: "-15px" } } },
    { target: ".shelf-img", content: t("myfarm.tour.step4"), placement: "left", disableBeacon: false, customProps: { rotate: 90, style: { marginTop: "-40px", marginLeft: "-20px" } } },
    { target: ".add-seed-btn", content: t("myfarm.tour.step5"), customProps: { rotate: 180, style: { marginTop: "-67px", marginLeft: "-15px" } } },
  ];

  const handleJoyrideCallback = ({ status }) => {
    if (["finished", "skipped"].includes(status)) {
      if (userId) localStorage.setItem(`hasSeenFarmTour_${userId}`, "true");
      setRunTutorial(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString());
  }, [isLoggedIn]);

  // 시싹 데이터 로드: 0번 선반만 반영, 범위 밖은 무시
  useEffect(() => {
    const fetchSeedlings = async () => {
      try {
        const data = await getSeedlings();
        const seedlings = data.seedlings || data || [];

        const oneShelf = createEmptyShelf();
        for (const s of seedlings) {
          const pos = s.position || {};
          const numOfShelf = pos.numOfShelf ?? 0;
          const r = pos.numOfShelfFloor ?? 0;
          const c = pos.numOfPot ?? 0;

          // 선반 0번만 허용
          if (numOfShelf !== 0) continue;
          if (r < 0 || r >= ROWS_PER_SHELF || c < 0 || c >= COLS_PER_ROW) continue;

          if (s.status === "EMPTY" || s.plant === "EMPTY") continue;
          if (countPlantsInShelf(oneShelf) >= MAX_POTS) break; // 안전 가드

          oneShelf[r][c] = {
            status: s.status,
            plant: s.plant,
            exp: s.exp,
            ph: s.ph,
            temperature: s.temperature,
            lightStrength: s.lightStrength,
            ttsDensity: s.ttsDensity,
            humidity: s.humidity,
          };
        }

        setShelves([oneShelf]); // 항상 한 개만 세팅
      } catch (error) {
        console.error(t("error.fetchSeedlingsFail") || "새싹 불러오기 실패", error);
      }
    };

    fetchSeedlings();
  }, [location, t]);

  const handleLogout = async () => {
    try {
      // await logout();
    } catch (err) {
      console.error(t("error.logoutFail") || "로그아웃 실패", err);
    }
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/");
  };

  // 백엔드로 추가 요청
  const sendSeedlingToBackend = async (shelfIdx, rowIdx, colIdx) => {
    try {
      await addSeedling({
        numOfShelf: shelfIdx,
        numOfShelfFloor: rowIdx,
        numOfPot: colIdx,
      });
    } catch (error) {
      console.error(t("error.sendSeedlingFail") || "시싹 전송 실패", error);
    }
  };

  const handleDeleteSeedling = async (shelfIdx, rowIdx, colIdx) => {
    try {
      await deleteSeedling({
        numOfShelf: shelfIdx,
        numOfShelfFloor: rowIdx,
        numOfPot: colIdx,
      });
      const newShelves = [...shelves];
      newShelves[shelfIdx][rowIdx][colIdx] = null;
      setShelves(newShelves);
    } catch (error) {
      console.error(t("error.deleteSeedlingFail") || "시싹 삭제 실패", error);
    }
  };

  // 1개 추가: 첫 번째 빈 칸
  const handleAddOne = () => {
    const shelf = shelves[0];
    const currentCount = countPlantsInShelf(shelf);
    if (currentCount >= MAX_POTS) {
      window.alert(t("warn.limitReached") || "최대 20개까지 추가할 수 있습니다.");
      return;
    }

    const newShelves = [...shelves];
    for (let r = 0; r < ROWS_PER_SHELF; r++) {
      for (let c = 0; c < COLS_PER_ROW; c++) {
        if (!newShelves[0][r][c]) {
          newShelves[0][r][c] = { status: "NORMAL", plant: "SPROUT" };
          setShelves(newShelves);
          sendSeedlingToBackend(0, r, c);
          return;
        }
      }
    }
  };

  // 한 줄 추가: 첫 번째 "완전히 빈" 행에만 5개 채우기
  const handleAddLine = () => {
    const shelf = shelves[0];
    const currentCount = countPlantsInShelf(shelf);
    if (currentCount >= MAX_POTS) {
      window.alert(t("warn.limitReached") || "최대 20개까지 추가할 수 있습니다.");
      return;
    }

    const emptyRowIdx = shelf.findIndex((row) => row.every((cell) => !cell));
    if (emptyRowIdx === -1) {
      window.alert(t("warn.noEmptyRow") || "비어 있는 줄이 없습니다.");
      return;
    }

    const newShelves = [...shelves];
    for (let c = 0; c < COLS_PER_ROW; c++) {
      // 안전 가드: 남은 칸이 5칸 미만이어도 초과하지 않게 채움
      if (countPlantsInShelf(newShelves[0]) >= MAX_POTS) break;
      newShelves[0][emptyRowIdx][c] = { status: "NORMAL", plant: "SPROUT" };
      sendSeedlingToBackend(0, emptyRowIdx, c);
    }
    setShelves(newShelves);
  };

  // 전체 추가: 남은 모든 빈 칸 채우기 (새 선반 생성 금지)
  const handleAddAll = () => {
    const shelf = shelves[0];
    const currentCount = countPlantsInShelf(shelf);
    if (currentCount >= MAX_POTS) {
      window.alert(t("warn.limitReached") || "최대 20개까지 추가할 수 있습니다.");
      return;
    }

    const newShelves = [...shelves];
    for (let r = 0; r < ROWS_PER_SHELF; r++) {
      for (let c = 0; c < COLS_PER_ROW; c++) {
        if (!newShelves[0][r][c]) {
          newShelves[0][r][c] = { status: "NORMAL", plant: "SPROUT" };
          sendSeedlingToBackend(0, r, c);
        }
        if (countPlantsInShelf(newShelves[0]) >= MAX_POTS) break;
      }
      if (countPlantsInShelf(newShelves[0]) >= MAX_POTS) break;
    }
    setShelves(newShelves);
  };

  const handlePlantClick = (shelfIndex, rowIndex, colIndex) => {
    navigate(`/myplant?shelf=${shelfIndex}&row=${rowIndex}&col=${colIndex}`);
  };

  const handleAddSeedlingAt = (shelfIdx, rowIdx, colIdx) => {
    const shelf = shelves[0];
    const currentCount = countPlantsInShelf(shelf);
    if (currentCount >= MAX_POTS) {
      window.alert(t("warn.limitReached") || "최대 20개까지 추가할 수 있습니다.");
      return;
    }

    const newShelves = [...shelves];
    if (!newShelves[shelfIdx][rowIdx][colIdx]) {
      newShelves[shelfIdx][rowIdx][colIdx] = { status: "NORMAL", plant: "SPROUT" };
      setShelves(newShelves);
      sendSeedlingToBackend(0, rowIdx, colIdx);
    }
  };

  function getPlantImageSrc(plant, status) {
    const p = plant ? plant.toLowerCase() : "";
    const s = status ? status.toUpperCase() : "";
    if (p === "empty" || s === "empty") return null;
    return `/${p}_${s}.png`;
  }

  // 파생 값들 (렌더링 시점 계산)
  const shelf = shelves[0];
  const currentCount = countPlantsInShelf(shelf);
  const remaining = Math.max(0, MAX_POTS - currentCount);
  const isFull = remaining === 0;
  const hasEmptyRow = shelf.some((row) => row.every((cell) => !cell));

  return (
    <div className="myfarm-container farm-bg">
      {userId && (
        <Joyride
          run={runTutorial}
          steps={steps}
          callback={handleJoyrideCallback}
          continuous
          scrollToFirstStep
          showProgress
          showSkipButton
          beaconComponent={CustomBeacon}
          locale={{
            back: t("button.back") || "Back",
            close: "닫기",
            last: "마침",
            next: "다음",
            skip: "건너뛰기",
          }}
          styles={{
            options: {
              arrowColor: "#ffffff",
              backgroundColor: "#ffffff",
              overlayColor: "rgba(0, 0, 0, 0.45)",
              primaryColor: "#4CAF50",
              textColor: "#333333",
              width: 360,
              borderRadius: 16,
              zIndex: 10000,
            },
            tooltip: {
              padding: "20px",
              fontSize: "15px",
              borderRadius: "16px",
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease-in-out",
            },
            buttonNext: {
              backgroundColor: "#4CAF50",
              color: "#fff",
              fontWeight: "600",
              borderRadius: "8px",
              padding: "10px 18px",
            },
            buttonBack: {
              color: "#4CAF50",
              fontWeight: "500",
              backgroundColor: "#F1F8E9",
              borderRadius: "8px",
              padding: "10px 16px",
              marginRight: "10px",
            },
            buttonClose: { color: "#999999", fontSize: "18px" },
            spotlight: { borderRadius: 12 },
          }}
        />
      )}

      {isLoggedIn && (
        <Header
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onLogoClick={() => navigate("/")}
          currentPage="myfarm"
        />
      )}

      <p className="farm-instruction">
        {t("myfarm.instruction")}
        {" "}
        <strong>({currentCount}/{MAX_POTS})</strong>
      </p>

      <div className="farm-buttons">
        <button className="add-btn" onClick={handleAddOne} disabled={isFull}>
          {t("myfarm.addOne")}
        </button>
        <button className="add-btn" onClick={handleAddLine} disabled={isFull || !hasEmptyRow}>
          {t("myfarm.addLine")}
        </button>
        <button className="add-btn" onClick={handleAddAll} disabled={isFull}>
          {t("myfarm.addAll")}
        </button>
      </div>

      <p className="farm-hint">
        {t("myfarm.hintPart1")} <strong>{t("myfarm.addOne")}</strong> {t("myfarm.hintPart2")}
      </p>

      <div className="farm-shelves">
        {/* 항상 선반 1개만 렌더 */}
        <div className="shelf" key={0}>
          <img src="/shelf.png" className="shelf-img" alt={t("alt.shelf")} />
          <div className="pots-layer">
            {shelf.map((row, rowIdx) => (
              <div className="pots-row" key={rowIdx}>
                {row.map((plant, colIdx) => (
                  <div className="pot-slot" key={colIdx} style={{ position: "relative" }}>
                    {plant && plant.status !== "EMPTY" && plant.plant !== "EMPTY" ? (
                      <>
                        <img
                          src={getPlantImageSrc(plant.plant, plant.status)}
                          className="plant-img"
                          alt={`${plant.plant}-${plant.status}`}
                          onClick={() => handlePlantClick(0, rowIdx, colIdx)}
                        />
                        <button
                          className="delete-seed-btn"
                          onClick={() => handleDeleteSeedling(0, rowIdx, colIdx)}
                          aria-label={t("myfarm.deleteSeedling")}
                          title={t("myfarm.deleteSeedling")}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <button
                        className="add-seed-btn"
                        onClick={() => handleAddSeedlingAt(0, rowIdx, colIdx)}
                        disabled={isFull}
                        title={isFull ? (t("warn.limitReached") || "최대 20개") : undefined}
                      >
                        +
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyFarm;
