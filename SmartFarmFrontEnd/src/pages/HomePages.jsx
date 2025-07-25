// src/pages/HomePages.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import StatusBox from '../components/StatusBox';
import { logout } from '../api/auth'; // ✅ 로그아웃 API 추가
import '../App.css';

function HomePages() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();

  // ✅ 로그인 상태 변경 시 localStorage에 반영
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  // ✅ 로그아웃 함수 정의
  const handleLogout = async () => {
    try {
      await logout(); // 백엔드 세션 종료 요청
    } catch (err) {
      console.error('백엔드 로그아웃 실패:', err);
    }
    localStorage.removeItem('isLoggedIn'); // 프론트 상태 초기화
    setIsLoggedIn(false);
    navigate('/'); // 홈으로 이동
  };

  return (
    <div className="home-container">
      <img src="/background.jpg" alt="background" className="background-img" />

      {/* ✅ 헤더에 로그아웃 핸들러 전달 */}
      <Header
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        onLogoClick={() => navigate('/')}
      />

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setShowLogin(false);
          }}
        />
      )}

      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setShowSignup(false);
          }}
        />
      )}

      <div className="search-wrapper">
        <div className="search-group">
          <div className="search-bar">
            <img src="/search-icon.png" className="search-icon" alt="검색 아이콘" />
            <input type="text" placeholder="Search" />
          </div>
          <img src="/bee.png" className="bee-img" alt="bee" />
        </div>
      </div>

      <p className="hashtag"># 오늘 상추 상태는 어때? &nbsp; # 토마토 수확은 언제쯤 가능해?</p>

      <div className="status-box-container">
        <StatusBox type="critical" count={0} />
        <StatusBox type="warning" count={0} />
        <StatusBox type="normal" count={0} />
      </div>
    </div>
  );
}

export default HomePages;
