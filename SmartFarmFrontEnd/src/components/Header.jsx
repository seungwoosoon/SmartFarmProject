/*상단 로고, 로그인버튼(네비게이션바)*/
// src/components/Header.jsx
import React from 'react';
import './Header.css';

function Header({ onLoginClick }) {
  return (
    <div className="header">
      <img
        src="/logo.png"
        alt="logo"
        className="logo"
        onClick={() => window.location.href = '/'}
      />
      <button className="login-btn" onClick={onLoginClick}>LOG-IN</button>
    </div>
  );
}

export default Header;


//Header.css는 만들지 않아도 되지만, 나중에 예쁘게 꾸미고 싶을 때 분리해도 좋아.

