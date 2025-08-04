import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../App.css';

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

        // ✅ 실제 달력 일정 API 연동 시 아래 주석 해제하고 mockSchedules 제거
        /*
        const fetchSchedules = async () => {
          try {
            const res = await fetch(`/api/farm-schedule?shelf=${shelf}&row=${row}&col=${col}`);
            const data = await res.json();
            setSchedules(data);
          } catch (err) {
            console.error('스케줄 불러오기 실패', err);
          }
        };
        fetchSchedules();
        */

        // ✅ 가상 스케줄 데이터 (테스트용)
        const mockSchedules = [
            { date: '2025-08-10', event: '수확 예정일' },
            { date: '2025-08-15', event: '비료 주기' },
        ];
        setSchedules(mockSchedules);
    }, [shelf, row, col]);

    return (
        <div className="myplant-container plant-bg"> {/* ✅ farm-bg 클래스 추가됨 */}
            <div className="myplant-header">My Plant🌿</div>
            <button className="back-btn" onClick={() => navigate(-1)}>←</button>

            {plantData && (
                <div className="plant-info-layout">
                    <div className="plant-left">
                        <img src="/tomato_red.png" alt="tomato" className="plant-large-img" />
                        <div className="plant-name">토마토</div>
                        <div className="plant-stage">성장 단계</div>
                    </div>

                    <div className="plant-right">
                        <p>🌡️ Temperature {plantData.temperature}°C</p>
                        <p>💧 Humidity {plantData.humidity}%</p>
                        <p>💡 Light Intensity {plantData.light}</p>
                        <p>pH Level {plantData.ph}</p>
                        <p>TDS Level {plantData.tds}ppm</p>

                        <button className="status-button">
                            {plantData.status === 'NORMAL' ? '적정 상태입니다' : plantData.status}
                        </button>

                        <button className="calendar-btn" onClick={() => setIsModalOpen(true)}>
                            재배일정
                        </button>
                    </div>
                </div>
            )}

            {/* ✅ 재배일정 달력 모달 - 디자인 개선 */}
            {isModalOpen && (
                <div className="calendar-modal">
                    <div className="calendar-content">
                        <button className="modal-close" onClick={() => setIsModalOpen(false)}>✖</button>

                        {/* 커스텀 스타일 클래스 부여 */}
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
    );
}

export default MyPlant;
