/* 로그인 모달 */

// src/components/LoginModal.jsx
import React, { useState } from 'react';
import '../App.css';
import { login } from '../api/auth'; // ✅ API 호출 함수 불러오기 -----------------백엔드랑 연결할땐이거 열어줘야함

function LoginModal({ onClose, onSwitchToSignup, onLoginSuccess }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  //-------------------------------------------------------------------------------백엔드랑 연결할땐이거 주석해야함
//   const handleLogin = async () => {
//   // 더미 로그인 조건: 아이디 admin / 비번 1234
//   if (loginId === 'admin' && password === '1234') {
//     alert('로그인 성공!');
//     onLoginSuccess({ login: loginId }); // 부모에게 로그인 정보 전달
//     onClose(); // 모달 닫기
//   } else {
//     alert('로그인 실패! 아이디 또는 비밀번호를 확인하세요.');
//   }
// };

  const handleLogin = async () => {
    try {
      const user = await login(loginId, password); // ✅ Spring 서버로 로그인 요청
      alert('로그인 성공!');
      onLoginSuccess(user);  // ✅ 부모(HomePages)에 로그인 성공 전달
      onClose();             // ✅ 모달 닫기
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인 실패! 아이디 또는 비밀번호를 확인하세요.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">LOG - IN</h2>

        <div className="login-input-group">
          <label>ID</label>
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디 입력"
          />
          <label>PW</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
          />
        </div>

        <button className="login-btn-modal" onClick={handleLogin}>
          LOG IN
        </button>

        <p className="switch-links" onClick={onSwitchToSignup}>
           SIGN - UP
        </p> 

        <button className="close-btn" onClick={onClose}>X</button>
      </div>
    </div>
  );
}

export default LoginModal;
