/* 로그인 모달 */

import React from 'react';
import '../App.css'; // 또는 Modal 전용 CSS로 따로 분리 가능

function LoginModal({ onClose, onSwitchToSignup }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <h2 className="modal-title">LOG - IN</h2>

        <div className="login-input-group">
          <label>ID</label>
          <input type="text" placeholder="아이디 입력" />
          <label>PW</label>
          <input type="password" placeholder="비밀번호 입력" />
        </div>

        <button className="login-btn-modal">LOG IN</button>

        <p className="switch-links" onClick={onSwitchToSignup}>
          FORGOT LOGIN / SIGN - UP
        </p>

        <button className="close-btn" onClick={onClose}>X</button>
      </div>
    </div>
  );
}

export default LoginModal;
