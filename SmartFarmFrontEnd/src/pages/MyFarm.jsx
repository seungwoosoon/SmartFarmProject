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

function createEmptyShelf() {
  return Array.from({ length: ROWS_PER_SHELF }, () =>
    Array(COLS_PER_ROW).fill(null)
  );
}

function MyFarm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [shelves, setShelves] = useState([createEmptyShelf()]);
  const [runTutorial, setRunTutorial] = useState(false);
  const [userId, setUserId] = useState(null);
  //const [userId, setUserId] = useState("dev_user");  // 🔧 개발용 하드코딩 ID (실제 서버 없을 때 기본값)
  

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const user = await getCurrentUser();      // /me가 phoneNumber 내려줌
      const key = user?.phoneNumber || "guest"; // 📌 전화번호 그대로 사용
      setUserId(key);
    } catch (error) {
      console.warn("서버에서 사용자 정보를 불러올 수 없습니다. 게스트로 진행합니다.");
      setUserId("guest");                       // 서버 실패 시 게스트 처리
    }
  };
  fetchUser();
}, []);


  // useEffect(() => {
  //   if (userId) {
  //     const hasSeen = localStorage.getItem(`hasSeenFarmTour_${userId}`);
  //     setRunTutorial(hasSeen !== "true");
  //   }
  // }, [userId]);

  useEffect(() => {
  if (userId) {
    const hasSeen = localStorage.getItem(`hasSeenFarmTour_${userId}`);
    if (hasSeen === "true") {
      setRunTutorial(false);
    } else {
      setRunTutorial(true);
    }
  }
}, [userId]);


  const steps = [
    { target: ".add-btn:nth-child(1)", content: t("myfarm.tour.step1"), customProps: {
    style: {
      marginTop: "30px",
      marginLeft: "-15px"
    }
  } },
    { target: ".add-btn:nth-child(2)", content: t("myfarm.tour.step2"), customProps: {
    style: {
      marginTop: "30px",
      marginLeft: "-15px"
    }
  } },
    { target: ".add-btn:nth-child(3)", content: t("myfarm.tour.step3"), customProps: {
    style: {
      marginTop: "30px",
      marginLeft: "-15px"
    }
  } },
    { target: ".shelf-img", content: t("myfarm.tour.step4"), placement: "left",disableBeacon: false, customProps: {
    rotate: 90,
    style: {
      marginTop: "-40px",
      marginLeft: "-20px"
    }
} },
    { target: ".add-seed-btn", content: t("myfarm.tour.step5") , customProps: {
    rotate: 180, 
      style: {
      marginTop: "-67px",
      marginLeft: "-15px"
    }
  }},
  ];

  const handleJoyrideCallback = ({ status }) => {
    if (["finished", "skipped"].includes(status)) {
      if (userId) {
        localStorage.setItem(`hasSeenFarmTour_${userId}`, "true");
      }
      setRunTutorial(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString());
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchSeedlings = async () => {
      try {
        const data = await getSeedlings();
        const seedlings = data.seedlings || data || [];
        const maxShelfIndex =
          seedlings.length > 0
            ? Math.max(...seedlings.map((s) => s.position.numOfShelf))
            : 0;

        const newShelves = [];
        for (let i = 0; i <= maxShelfIndex; i++) {
          newShelves.push(createEmptyShelf());
        }

        for (let s of seedlings) {
          if (s.status === "EMPTY" || s.plant === "EMPTY") continue;

          const {
            position: { numOfShelf, numOfShelfFloor, numOfPot },
            status,
            plant,
            exp,
            ph,
            temperature,
            lightStrength,
            ttsDensity,
            humidity,
          } = s;

          if (
            numOfShelf >= newShelves.length ||
            numOfShelfFloor >= ROWS_PER_SHELF ||
            numOfPot >= COLS_PER_ROW
          ) {
            console.warn(
              `${t(
                "warn.invalidIndex"
              )}: ${numOfShelf}-${numOfShelfFloor}-${numOfPot}`
            );
            continue;
          }

          newShelves[numOfShelf][numOfShelfFloor][numOfPot] = {
            status,
            plant,
            exp,
            ph,
            temperature,
            lightStrength,
            ttsDensity,
            humidity,
          };
        }
        setShelves(newShelves);
      } catch (error) {
        console.error(t("error.fetchSeedlingsFail"), error);
      }
    };

    fetchSeedlings();
  }, [location, t]);

  const handleLogout = async () => {
    try {
      // await logout();
    } catch (err) {
      console.error(t("error.logoutFail"), err);
    }
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/");
  };

  const sendSeedlingToBackend = async (shelfIdx, rowIdx, colIdx) => {
    try {
      await addSeedling({
        numOfShelf: shelfIdx,
        numOfShelfFloor: rowIdx,
        numOfPot: colIdx,
      });
    } catch (error) {
      console.error(t("error.sendSeedlingFail"), error);
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
      console.error(t("error.deleteSeedlingFail"), error);
    }
  };

  const handleAddOne = () => {
    const newShelves = [...shelves];
    for (let s = 0; s < newShelves.length; s++) {
      for (let r = 0; r < ROWS_PER_SHELF; r++) {
        for (let c = 0; c < COLS_PER_ROW; c++) {
          if (!newShelves[s][r][c]) {
            newShelves[s][r][c] = { status: "NORMAL", plant: "SPROUT" };
            setShelves(newShelves);
            sendSeedlingToBackend(s, r, c);
            return;
          }
        }
      }
    }
    const newShelf = createEmptyShelf();
    newShelf[0][0] = { status: "NORMAL", plant: "SPROUT" };
    newShelves.push(newShelf);
    setShelves(newShelves);
    sendSeedlingToBackend(newShelves.length - 1, 0, 0);
  };

  const handleAddLine = () => {
    const newShelves = [...shelves];
    for (let s = 0; s < newShelves.length; s++) {
      for (let r = 0; r < ROWS_PER_SHELF; r++) {
        const isRowEmpty = newShelves[s][r].every((cell) => !cell);
        if (isRowEmpty) {
          newShelves[s][r] = Array(COLS_PER_ROW)
            .fill()
            .map(() => ({ status: "NORMAL", plant: "SPROUT" }));
          setShelves(newShelves);
          for (let c = 0; c < COLS_PER_ROW; c++) sendSeedlingToBackend(s, r, c);
          return;
        }
      }
    }
    const newShelf = createEmptyShelf();
    newShelf[0] = Array(COLS_PER_ROW)
      .fill()
      .map(() => ({ status: "NORMAL", plant: "SPROUT" }));
    newShelves.push(newShelf);
    setShelves(newShelves);
    const newIndex = newShelves.length - 1;
    for (let r = 0; r < ROWS_PER_SHELF; r++) {
      for (let c = 0; c < COLS_PER_ROW; c++)
        sendSeedlingToBackend(newIndex, r, c);
    }
  };

  const handleAddAll = () => {
    const newShelves = [...shelves];
    const lastShelf = newShelves[newShelves.length - 1];
    const isLastShelfEmpty = lastShelf.every((row) =>
      row.every((cell) => !cell)
    );

    if (!isLastShelfEmpty) {
      const newShelf = Array.from({ length: ROWS_PER_SHELF }, () =>
        Array(COLS_PER_ROW)
          .fill()
          .map(() => ({ status: "NORMAL", plant: "SPROUT" }))
      );
      newShelves.push(newShelf);
      setShelves(newShelves);
      const newIdx = newShelves.length - 1;
      for (let r = 0; r < ROWS_PER_SHELF; r++) {
        for (let c = 0; c < COLS_PER_ROW; c++)
          sendSeedlingToBackend(newIdx, r, c);
      }
    } else {
      for (let r = 0; r < ROWS_PER_SHELF; r++) {
        for (let c = 0; c < COLS_PER_ROW; c++) {
          lastShelf[r][c] = { status: "NORMAL", plant: "SPROUT" };
          sendSeedlingToBackend(newShelves.length - 1, r, c);
        }
      }
      setShelves(newShelves);
    }
  };

  const handlePlantClick = (shelfIndex, rowIndex, colIndex) => {
    navigate(`/myplant?shelf=${shelfIndex}&row=${rowIndex}&col=${colIndex}`);
  };

  const handleAddSeedlingAt = (shelfIdx, rowIdx, colIdx) => {
    const newShelves = [...shelves];
    if (!newShelves[shelfIdx][rowIdx][colIdx]) {
      newShelves[shelfIdx][rowIdx][colIdx] = {
        status: "NORMAL",
        plant: "SPROUT",
      };
      setShelves(newShelves);
      sendSeedlingToBackend(shelfIdx, rowIdx, colIdx);
    }
  };

  function getPlantImageSrc(plant, status) {
    const p = plant ? plant.toLowerCase() : "";
    const s = status ? status.toLowerCase() : "";
    if (p === "empty" || s === "empty") return null;
    return `/${p}_${s}.png`;
  }

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
    primaryColor: "#4CAF50", // 상큼한 연두
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
    transition: "all 0.3s ease-in-out"
  },
  buttonNext: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontWeight: "600",
    borderRadius: "8px",
    padding: "10px 18px"
  },
  buttonBack: {
    color: "#4CAF50",
    fontWeight: "500",
    backgroundColor: "#F1F8E9",
    borderRadius: "8px",
    padding: "10px 16px",
    marginRight: "10px"
  },
  buttonClose: {
    color: "#999999",
    fontSize: "18px"
  },
  spotlight: {
    borderRadius: 12
  }
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

      <p className="farm-instruction">{t("myfarm.instruction")}</p>

      <div className="farm-buttons">
        <button className="add-btn" onClick={handleAddOne}>
          {t("myfarm.addOne")}
        </button>
        <button className="add-btn" onClick={handleAddLine}>
          {t("myfarm.addLine")}
        </button>
        <button className="add-btn" onClick={handleAddAll}>
          {t("myfarm.addAll")}
        </button>
      </div>

      <p className="farm-hint">
        {t("myfarm.hintPart1")} <strong>{t("myfarm.addOne")}</strong> {t("myfarm.hintPart2")}
      </p>

      <div className="farm-shelves">
        {shelves.map((shelf, shelfIdx) => (
          <div className="shelf" key={shelfIdx}>
            <img src="/shelf.png" className="shelf-img" alt={t("alt.shelf")} />
            <div className="pots-layer">
              {shelf.map((row, rowIdx) => (
                <div className="pots-row" key={rowIdx}>
                  {row.map((plant, colIdx) => (
                    <div
                      className="pot-slot"
                      key={colIdx}
                      style={{ position: "relative" }}
                    >
                      {plant && plant.status !== "EMPTY" && plant.plant !== "EMPTY" ? (
                        <>
                          <img
                            src={getPlantImageSrc(plant.plant, plant.status)}
                            className="plant-img"
                            alt={`${plant.plant}-${plant.status}`}
                            onClick={() => handlePlantClick(shelfIdx, rowIdx, colIdx)}
                          />
                          <button
                            className="delete-seed-btn"
                            onClick={() => handleDeleteSeedling(shelfIdx, rowIdx, colIdx)}
                            aria-label={t("myfarm.deleteSeedling")}
                            title={t("myfarm.deleteSeedling")}
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <button
                          className="add-seed-btn"
                          onClick={() => handleAddSeedlingAt(shelfIdx, rowIdx, colIdx)}
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
        ))}
      </div>
    </div>
  );
}

export default MyFarm;
