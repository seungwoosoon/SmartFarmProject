
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../App.css';

const ROWS_PER_SHELF = 4;
const COLS_PER_ROW = 5;

function MyFarm() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });

    const [shelves, setShelves] = useState([createEmptyShelf()]);

    useEffect(() => {
        localStorage.setItem('isLoggedIn', isLoggedIn);
    }, [isLoggedIn]);

    const handleLogout = async () => {
        try {
            // await logout();
        } catch (err) {
            console.error('로그아웃 실패:', err);
        }
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
        navigate('/');
    };

    function createEmptyShelf() {
        return Array.from({ length: ROWS_PER_SHELF }, () =>
            Array(COLS_PER_ROW).fill(null)
        );
    }

    const handleAddOne = () => {
        const newShelves = [...shelves];

        for (let s = 0; s < newShelves.length; s++) {
            for (let r = 0; r < ROWS_PER_SHELF; r++) {
                for (let c = 0; c < COLS_PER_ROW; c++) {
                    if (!newShelves[s][r][c]) {
                        newShelves[s][r][c] = { status: 'NORMAL' };
                        setShelves(newShelves);
                        return;
                    }
                }
            }
        }

        const newShelf = createEmptyShelf();
        newShelf[0][0] = { status: 'NORMAL' };
        newShelves.push(newShelf);
        setShelves(newShelves);
    };

    const handleAddLine = () => {
        const newShelves = [...shelves];

        for (let s = 0; s < newShelves.length; s++) {
            for (let r = 0; r < ROWS_PER_SHELF; r++) {
                const isRowEmpty = newShelves[s][r].every(cell => !cell);
                if (isRowEmpty) {
                    newShelves[s][r] = Array(COLS_PER_ROW).fill({ status: 'NORMAL' });
                    setShelves(newShelves);
                    return;
                }
            }
        }

        const newShelf = createEmptyShelf();
        newShelf[0] = Array(COLS_PER_ROW).fill({ status: 'NORMAL' });
        newShelves.push(newShelf);
        setShelves(newShelves);
    };

    const handleAddAll = () => {
        const newShelves = [...shelves];
        const lastShelf = newShelves[newShelves.length - 1];

        const isLastShelfEmpty = lastShelf.every(row =>
            row.every(cell => !cell)
        );

        if (!isLastShelfEmpty) {
            const newShelf = Array.from({ length: ROWS_PER_SHELF }, () =>
                Array(COLS_PER_ROW).fill({ status: 'NORMAL' })
            );
            newShelves.push(newShelf);
        } else {
            for (let r = 0; r < ROWS_PER_SHELF; r++) {
                for (let c = 0; c < COLS_PER_ROW; c++) {
                    lastShelf[r][c] = { status: 'NORMAL' };
                }
            }
        }

        setShelves(newShelves);
    };

    const handlePlantClick = (shelfIndex, rowIndex, colIndex) => {
        navigate(`/myplant?shelf=${shelfIndex}&row=${rowIndex}&col=${colIndex}`);
    };

    const handleAddSeedlingAt = (shelfIdx, rowIdx, colIdx) => {
        const newShelves = [...shelves];
        if (!newShelves[shelfIdx][rowIdx][colIdx]) {
            newShelves[shelfIdx][rowIdx][colIdx] = { status: 'NORMAL' };
            setShelves(newShelves);
        }
    };

    return (
        <div className="myfarm-container farm-bg"> {/* ✅ farm-bg 클래스 추가됨 */}
            {isLoggedIn && (
                <Header
                    isLoggedIn={isLoggedIn}
                    onLogout={handleLogout}
                    onLogoClick={() => navigate('/')}
                    currentPage="myfarm"
                />
            )}

            {/* 👇 상단 설명 */}
            <p className="farm-instruction">
                선반에 세싹을 추가해 나만의 스마트팜을 시작해보세요 🌱
            </p>

            <div className="farm-buttons">
                <button className="add-btn" onClick={handleAddOne}>+ 하나 추가</button>
                <button className="add-btn" onClick={handleAddLine}>+ 줄 추가</button>
                <button className="add-btn" onClick={handleAddAll}>+ 전체 추가</button>
            </div>

            {/* 👇 하단 힌트 문구 */}
            <p className="farm-hint">
                세싹을 심고 관리하려면 <strong>+하나 추가</strong>를 눌러보세요 🌿
            </p>

            <div className="farm-shelves">
                {shelves.map((shelf, shelfIdx) => (
                    <div className="shelf" key={shelfIdx}>
                        <img src="/shelf.png" className="shelf-img" alt="shelf" />
                        <div className="pots-layer">
                            {shelf.map((row, rowIdx) => (
                                <div className="pots-row" key={rowIdx}>
                                    {row.map((plant, colIdx) => (
                                        plant ? (
                                            <img
                                                key={colIdx}
                                                src="/normal.png"
                                                className="plant-img"
                                                alt="normal"
                                                onClick={() =>
                                                    handlePlantClick(shelfIdx, rowIdx, colIdx)
                                                }
                                            />
                                        ) : (
                                            <button
                                                key={colIdx}
                                                className="add-seed-btn"
                                                onClick={() =>
                                                    handleAddSeedlingAt(shelfIdx, rowIdx, colIdx)
                                                }
                                            >
                                                +
                                            </button>
                                        )
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
