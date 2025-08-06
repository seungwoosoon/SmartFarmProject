/* critical/warning/normal 박스 */

// src/components/StatusBox.jsx
import React from 'react';

function StatusBox({ type, count }) {
  const colorMap = {
    critical: '/tomato_red.png',
    warning: '/tomato_yellow.png',
    normal: '/tomato_green.png',
  };

  return (
    <div className={`status-box ${type}`}>
      <img src={colorMap[type]} alt={type} className="tomato-icon" />
      <p>{type}</p>
      <p>X {count}</p>
    </div>
  );
}

export default StatusBox;
