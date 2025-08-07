// src/pages/MyPlant.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Bar from '../components/Bar';
import '../components/Bar.css';
import '../App.css'; // 스타일 포함

function MyPlant() {
  const { t } = useTranslation();

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
        console.error(t('error.loadPlantDataFail'), err);
      }
    };
    fetchPlant();
    */

    // Mock 데이터
    const mockData = {
      temperature: 17.5, //24.5
      humidity: 80,  // 60
      light: 540,
      ph: 10.3, // 6.3
      tds: 720,
      status: 'NORMAL',
    };
    setPlantData(mockData);

    const mockSchedules = [
      { date: '2025-08-10', event: t('schedule.harvest') },
      { date: '2025-08-15', event: t('schedule.fertilizer') },
    ];
    setSchedules(mockSchedules);
  }, [shelf, row, col, t]);

  return (
    <>
      <div className="myplant-container plant-bg">
        <div className="myplant-header">
          {t('myplant.title')}🌿
          <p className="myplant-subtext">{t('myplant.subtitle')}</p>
        </div>

        <button className="back-btn" onClick={() => navigate(-1)}>
          ← {t('button.back')}
        </button>

        {plantData && (
          <div className="plant-info-box">
            <div className="plant-left">
              <img src="/tomato_red.png" alt={t('alt.tomato')} className="plant-large-img" />
              <div className="plant-name">{t('plant.tomato')}</div>
              <div className="plant-stage">{t('plant.stage')}</div>
            </div>

            <div className="plant-right">
              {/* 기존 카드형 센서 데이터 대신 Bar 컴포넌트로 교체 */}
              <div className="sensor-bars">
                <Bar label={t('sensor.temperature')} value={plantData.temperature} min={0} max={50} unit="°C" icon="🌡️" />
                <Bar label={t('sensor.humidity')} value={plantData.humidity} min={0} max={100} unit="%" icon="💧" />
                <Bar label={t('sensor.light')} value={plantData.light} min={0} max={1000} unit="" icon="💡" />
                <Bar label={t('sensor.ph')} value={plantData.ph} min={0} max={14} unit="" icon="🧪" />
                <Bar label={t('sensor.tds')} value={plantData.tds} min={0} max={2000} unit="ppm" icon="🧂" />
              </div>

              <div className="button-group">
                <div className="status-label">
                  {plantData.status === 'NORMAL' ? t('plant.statusNormal') : plantData.status}
                </div>
                <button className="calendar-btn" onClick={() => setIsModalOpen(true)}>
                  📅 {t('button.schedule')}
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
                locale={t('calendar.locale')}
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
        SmartFarm {t('footer.systemName')} v1.0.0 &nbsp;|&nbsp; © 2025 FarmLink Team
      </p>
    </>
  );
}

export default MyPlant;
