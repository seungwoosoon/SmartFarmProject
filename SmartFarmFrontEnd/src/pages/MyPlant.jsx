// src/pages/MyPlant.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

function MyPlant() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const shelf = queryParams.get('shelf');
  const row = queryParams.get('row');
  const col = queryParams.get('col');

  const [plantData, setPlantData] = useState(null);

  useEffect(() => {
    // ✅ 실제 API 연동 시 아래 주석 해제하고 위 가상 데이터 제거
    /*
    const fetchPlant = async () => {
      try {
        const response = await fetch(`/api/farm-plant?shelf=${shelf}&row=${row}&col=${col}`);
        const data = await response.json();
        setPlantData(data);
      } catch (err) {
        console.error('식물 데이터 불러오기 실패', err);
      }
    };
    fetchPlant();
    */

    // ✅ 가상 데이터 (백엔드 연동 전용)
    const mockData = {
      temperature: 24.5,
      humidity: 60,
      light: 540,
      ph: 6.3,
      tds: 720,
      status: 'NORMAL',
    };
    setPlantData(mockData);
  }, [shelf, row, col]);

  return (
    <div className="myplant-container">
      <button className="back-btn" onClick={() => navigate(-1)}>←</button>
      {plantData && (
        <div className="plant-info-layout">
          <div className="plant-left">
            <img src="/tomato_red.png" alt="tomato" className="plant-large-img" />
            <div className="plant-name">토마토</div>
            <div className="plant-stage">성장 단계</div>
          </div>
          <div className="plant-right">
            <p>🌡️ 온도 {plantData.temperature}°C</p>
            <p>💧 습도 {plantData.humidity}%</p>
            <p>💡 조도 {plantData.light}</p>
            <p>PH 농도 {plantData.ph}</p>
            <p>TDS 농도 {plantData.tds}ppm</p>
            <button className="status-button">
              {plantData.status === 'NORMAL' ? '적정 상태입니다' : plantData.status}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPlant;
