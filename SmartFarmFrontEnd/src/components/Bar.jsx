// src/components/Bar.jsx
import React from "react";
import "./Bar.css";

function getBarColor(label, value) {
  switch (label) {
    case "Temperature":
      if (value < 15 || value > 32) return "bar-danger";
      if ((value >= 15 && value < 18) || (value > 28 && value <= 32)) return "bar-warning";
      return "bar-normal";
    case "Humidity":
      if (value < 40 || value > 85) return "bar-danger";
      if ((value >= 40 && value < 55) || (value > 75 && value <= 85)) return "bar-warning";
      return "bar-normal";
    case "Light":
      if (value < 250 || value > 900) return "bar-danger";
      if ((value >= 250 && value < 400) || (value > 800 && value <= 900)) return "bar-warning";
      return "bar-normal";
    case "pH":
      if (value < 5.0 || value > 7.5) return "bar-danger";
      if ((value >= 5.0 && value < 5.5) || (value > 7 && value <= 7.5)) return "bar-warning";
      return "bar-normal";
    case "TDS":
      if (value < 500 || value > 1000) return "bar-danger";
      if ((value >= 500 && value < 600) || (value > 900 && value <= 1000)) return "bar-warning";
      return "bar-normal";
    default:
      return "bar-normal";
  }
}

// 소수 자릿수 제어(옵셔널)
const formatNumber = (n, decimals) => {
  if (typeof decimals === "number") return Number(n).toFixed(decimals);
  // 기본: 정수면 0자리, 아니면 1자리
  return Math.abs(n) % 1 === 0 ? Number(n).toFixed(0) : Number(n).toFixed(1);
};

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

export default function Bar({ label, value, min, max, unit, icon, decimals }) {
  const percent = clamp(((value - min) / (max - min)) * 100, 0, 100);
  const barColorClass = getBarColor(label, value);
  const display = formatNumber(value, decimals);

  return (
    <div className="bar-container">
      <div className="bar-label">
        <span aria-hidden="true">{icon}</span>
        {label}:{" "}
        {/* 값이 바뀔 때 key를 바꿔서 살짝 애니메이션 */}
        <strong className="bar-number" key={display}>
          {display}
          {unit}
        </strong>
      </div>

      <div className="bar-bg" role="img" aria-label={`${label} ${display}${unit}`}>
        <div
          className={`bar-fill ${barColorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="bar-scale">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}
