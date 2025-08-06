import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../App.css'; // 여기에 스타일 정의되어 있어야 함

function MyPlant() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const shelf = queryParams.get('shelf');
  const row = queryParams.get('row');
  const col = queryParams.get('col');

  const [plantData, setPlantData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState(new Date());
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    // 실제 API 연동 시 아래 주석 해제
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

    //Mock 데이터
    const mockData = {
      temperature: 24.5,
      humidity: 60,
      light: 540,
      ph: 6.3,
      tds: 720,
      status: 'NORMAL',
    };
    setPlantData(mockData);

    const mockSchedules = [
      { date: '2025-08-10', event: '수확 예정일' },
      { date: '2025-08-15', event: '비료 주기' },
    ];
    setSchedules(mockSchedules);
  }, [shelf, row, col]);

  return (
    <>
      <div className="myplant-container plant-bg">
        <div className="myplant-header">
          My Plant🌿
          <p className="myplant-subtext">현재 식물의 상태와 센서 데이터를 한눈에 확인해보세요.</p>
        </div>

        <button className="back-btn" onClick={() => navigate(-1)}>←</button>

        {plantData && (
          <div className="plant-info-box">
            <div className="plant-left">
              <img src="/tomato_red.png" alt="tomato" className="plant-large-img" />
              <div className="plant-name">토마토</div>
              <div className="plant-stage">성장 단계</div>
            </div>

            <div className="plant-right">
              <div className="sensor-cards">
                <div className="sensor-card">🌡️ Temperature: {plantData.temperature}°C</div>
                <div className="sensor-card">💧 Humidity: {plantData.humidity}%</div>
                <div className="sensor-card">💡 Light: {plantData.light}</div>
                <div className="sensor-card">🧪 pH Level: {plantData.ph}</div>
                <div className="sensor-card">🧂 TDS Level: {plantData.tds}ppm</div>
              </div>

              <div className="button-group">
                <div className="status-label">
                  {plantData.status === 'NORMAL' ? '적정 상태입니다' : plantData.status}
                </div>
                <button className="calendar-btn" onClick={() => setIsModalOpen(true)}>
                  📅 재배일정
                </button>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="calendar-modal">
            <div className="calendar-content">
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✖</button>

              <Calendar
                value={value}
                onChange={setValue}
                className="custom-calendar"
                locale="ko-KR"
                formatDay={(locale, date) => date.getDate()}
                calendarType="gregory"
              />

              <ul className="event-list">
                {schedules.map((item, idx) => (
                  <li key={idx}>📅 {item.date} - {item.event}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정 Footer */}
      <p className="footer-info">
        SmartFarm 시스템 v1.0.0 &nbsp;|&nbsp; © 2025 FarmLink Team
      </p>
    </>
  );
}

export default MyPlant;
