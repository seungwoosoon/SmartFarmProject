// src/components/CustomBeacon.jsx
import React from 'react';
import './CustomBeacon.css';

const CustomBeacon = ({ styles, className, onClick, step }) => {
  // ✅ 개별 step에서 전달된 커스텀 props 추출
  const rotate = step?.customProps?.rotate || 0; // 기본 회전 없음
  const customStyle = step?.customProps?.style || {}; // 기본 위치 조정 없음

  return (
    <div
      className={`custom-beacon ${className || ''}`}
      onClick={onClick}
      style={{
        ...styles,
        ...customStyle, // ✅ step마다 개별 위치 조정
        zIndex: 10000,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
      }}
    >
      <img
        src="/beacon_cursor.png"
        alt="Tutorial Beacon"
        className="beacon-icon"
        style={{
          width: '56px',
          height: '56px',
          objectFit: 'contain',
          pointerEvents: 'none',
          transform: `rotate(${rotate}deg)`, // ✅ 회전 각도 개별 적용
          transition: 'transform 0.3s ease',
        }}
      />
    </div>
  );
};

export default CustomBeacon;
