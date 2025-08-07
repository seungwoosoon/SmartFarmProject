import React from 'react';
import './Bar.css';

function getBarColor(label, value) {
  // 센서별 정상/경고/위험 범위 판단 (예시 기준)
  switch (label) {
    case 'Temperature':
      if (value < 15 || value > 32) return 'bar-danger';
      if ((value >= 15 && value < 18) || (value > 28 && value <= 32)) return 'bar-warning';
      return 'bar-normal';
    case 'Humidity':
      if (value < 40 || value > 85) return 'bar-danger';
      if ((value >= 40 && value < 55) || (value > 75 && value <= 85)) return 'bar-warning';
      return 'bar-normal';
    case 'Light':
      if (value < 250 || value > 900) return 'bar-danger';
      if ((value >= 250 && value < 400) || (value > 800 && value <= 900)) return 'bar-warning';
      return 'bar-normal';
    case 'pH':
      if (value < 5.0 || value > 7.5) return 'bar-danger';
      if ((value >= 5.0 && value < 5.5) || (value > 7 && value <= 7.5)) return 'bar-warning';
      return 'bar-normal';
    case 'TDS':
      if (value < 500 || value > 1000) return 'bar-danger';
      if ((value >= 500 && value < 600) || (value > 900 && value <= 1000)) return 'bar-warning';
      return 'bar-normal';
    default:
      return 'bar-normal';
  }
}

function Bar({ label, value, min, max, unit, icon }) {
  const percent = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const barColorClass = getBarColor(label, value);

  return (
    <div className="bar-container">
      <div className="bar-label">
        <span>{icon}</span> {label}: <strong>{value}{unit}</strong>
      </div>
      <div className="bar-bg">
        <div
          className={`bar-fill ${barColorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="bar-scale">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default Bar;
