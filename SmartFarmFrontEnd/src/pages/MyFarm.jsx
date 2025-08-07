// src/pages/MyFarm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { addSeedling, getSeedlings } from '../api/farm';
import '../App.css';

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
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [shelves, setShelves] = useState([createEmptyShelf()]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchSeedlings = async () => {
      try {
        const data = await getSeedlings();
        const seedlings = data.seedlings || data || [];
        const maxShelfIndex = seedlings.length > 0
          ? Math.max(...seedlings.map(s => s.position.numOfShelf))
          : 0;

        const newShelves = [];
        for (let i = 0; i <= maxShelfIndex; i++) {
          newShelves.push(createEmptyShelf());
        }

        for (let s of seedlings) {
          if (s.status === "EMPTY" || s.plant === "EMPTY") continue;

          const {
            position: { numOfShelf, numOfShelfFloor, numOfPot },
            status, plant, exp, ph, temperature, lightStrength, ttsDensity, humidity
          } = s;

          if (
            numOfShelf >= newShelves.length ||
            numOfShelfFloor >= ROWS_PER_SHELF ||
            numOfPot >= COLS_PER_ROW
          ) {
            console.warn(`${t('warn.invalidIndex')}: ${numOfShelf}-${numOfShelfFloor}-${numOfPot}`);
            continue;
          }

          newShelves[numOfShelf][numOfShelfFloor][numOfPot] = {
            status, plant, exp, ph, temperature, lightStrength, ttsDensity, humidity
          };
        }
        setShelves(newShelves);
      } catch (error) {
        console.error(t('error.fetchSeedlingsFail'), error);
      }
    };

    fetchSeedlings();
  }, [location, t]);

  const handleLogout = async () => {
    try {
      // await logout();
    } catch (err) {
      console.error(t('error.logoutFail'), err);
    }
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    navigate('/');
  };

  const sendSeedlingToBackend = async (shelfIdx, rowIdx, colIdx) => {
    try {
      await addSeedling({ numOfShelf: shelfIdx, numOfShelfFloor: rowIdx, numOfPot: colIdx });
    } catch (error) {
      console.error(t('error.sendSeedlingFail'), error);
    }
  };

  const handleAddOne = () => {
    const newShelves = [...shelves];
    for (let s = 0; s < newShelves.length; s++) {
      for (let r = 0; r < ROWS_PER_SHELF; r++) {
        for (let c = 0; c < COLS_PER_ROW; c++) {
          if (!newShelves[s][r][c]) {
            newShelves[s][r][c] = { status: 'NORMAL', plant: 'SPROUT' };
            setShelves(newShelves);
            sendSeedlingToBackend(s, r, c);
            return;
          }
        }
      }
    }
    const newShelf = createEmptyShelf();
    newShelf[0][0] = { status: 'NORMAL', plant: 'SPROUT' };
    newShelves.push(newShelf);
    setShelves(newShelves);
    sendSeedlingToBackend(newShelves.length - 1, 0, 0);
  };

  const handleAddLine = () => {
    const newShelves = [...shelves];
    for (let s = 0; s < newShelves.length; s++) {
      for (let r = 0; r < ROWS_PER_SHELF; r++) {
        const isRowEmpty = newShelves[s][r].every(cell => !cell);
        if (isRowEmpty) {
          newShelves[s][r] = Array(COLS_PER_ROW).fill().map(() => ({ status: 'NORMAL', plant: 'SPROUT' }));
          setShelves(newShelves);
          for (let c = 0; c < COLS_PER_ROW; c++) sendSeedlingToBackend(s, r, c);
          return;
        }
      }
    }
    const newShelf = createEmptyShelf();
    newShelf[0] = Array(COLS_PER_ROW).fill().map(() => ({ status: 'NORMAL', plant: 'SPROUT' }));
    newShelves.push(newShelf);
    setShelves(newShelves);
    const newIndex = newShelves.length - 1;
    for (let r = 0; r < ROWS_PER_SHELF; r++) {
      for (let c = 0; c < COLS_PER_ROW; c++) sendSeedlingToBackend(newIndex, r, c);
    }
  };

  const handleAddAll = () => {
    const newShelves = [...shelves];
    const lastShelf = newShelves[newShelves.length - 1];
    const isLastShelfEmpty = lastShelf.every(row => row.every(cell => !cell));

    if (!isLastShelfEmpty) {
      const newShelf = Array.from({ length: ROWS_PER_SHELF }, () =>
        Array(COLS_PER_ROW).fill().map(() => ({ status: 'NORMAL', plant: 'SPROUT' })));
      newShelves.push(newShelf);
      setShelves(newShelves);
      const newIdx = newShelves.length - 1;
      for (let r = 0; r < ROWS_PER_SHELF; r++) {
        for (let c = 0; c < COLS_PER_ROW; c++) sendSeedlingToBackend(newIdx, r, c);
      }
    } else {
      for (let r = 0; r < ROWS_PER_SHELF; r++) {
        for (let c = 0; c < COLS_PER_ROW; c++) {
          lastShelf[r][c] = { status: 'NORMAL', plant: 'SPROUT' };
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
      newShelves[shelfIdx][rowIdx][colIdx] = { status: 'NORMAL', plant: 'SPROUT' };
      setShelves(newShelves);
      sendSeedlingToBackend(shelfIdx, rowIdx, colIdx);
    }
  };

  // plant와 status에 따른 이미지 경로 반환 함수
  function getPlantImageSrc(plant, status) {
    const p = plant ? plant.toLowerCase() : '';
    const s = status ? status.toLowerCase() : '';

    if (p === 'empty' || s === 'empty') return null;

    // 조합 이미지: plant_status.png (예: flower_warning.png)
    return `/${p}_${s}.png`;
  }

  return (
    <div className="myfarm-container farm-bg">
      {isLoggedIn && (
        <Header
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onLogoClick={() => navigate('/')}
          currentPage="myfarm"
        />
      )}

      <p className="farm-instruction">{t('myfarm.instruction')}</p>

      <div className="farm-buttons">
        <button className="add-btn" onClick={handleAddOne}>{t('myfarm.addOne')}</button>
        <button className="add-btn" onClick={handleAddLine}>{t('myfarm.addLine')}</button>
        <button className="add-btn" onClick={handleAddAll}>{t('myfarm.addAll')}</button>
      </div>

      <p className="farm-hint">
        {t('myfarm.hintPart1')} <strong>{t('myfarm.addOne')}</strong> {t('myfarm.hintPart2')}
      </p>

      <div className="farm-shelves">
        {shelves.map((shelf, shelfIdx) => (
          <div className="shelf" key={shelfIdx}>
            <img src="/shelf.png" className="shelf-img" alt={t('alt.shelf')} />
            <div className="pots-layer">
              {shelf.map((row, rowIdx) => (
                <div className="pots-row" key={rowIdx}>
                  {row.map((plant, colIdx) => (
                    <div className="pot-slot" key={colIdx}>
                      {(plant && plant.status !== 'EMPTY' && plant.plant !== 'EMPTY') ? (
                        <img
                          src={getPlantImageSrc(plant.plant, plant.status)}
                          className="plant-img"
                          alt={`${plant.plant}-${plant.status}`}
                          onClick={() => handlePlantClick(shelfIdx, rowIdx, colIdx)}
                        />
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
