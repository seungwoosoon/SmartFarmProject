// src/pages/HomePages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import StatusBox from '../components/StatusBox';
import { logout } from '../api/auth';
import '../App.css';

function HomePages() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const typingTextRef = useRef(['오늘 상추 상태는 어때?', '토마토 수확은 언제쯤 가능해?']);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    let textIndex = 0;
    let charIndex = 0;
    let typingInterval;

    const typeNextChar = () => {
      const message = typingTextRef.current[textIndex];

      if (charIndex < message.length) {
        setCurrentText(message.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          charIndex = 0;
          textIndex = (textIndex + 1) % typingTextRef.current.length;
          setCurrentText(''); // 초기화
          setTimeout(() => {
            typingInterval = setInterval(typeNextChar, 100);
          }, 300); // 초기화 후 잠시 대기
        }, 2000);
      }
    };

    typingInterval = setInterval(typeNextChar, 100);

    return () => clearInterval(typingInterval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('백엔드 로그아웃 실패:', err);
    }
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="home-container">
      <img src="/background.jpg" alt="background" className="background-img" />

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

      {/* ✅ 꿀벌 + 말풍선 묶음 */}
      <div className="bee-and-bubble">
        <img src="/bee.png" className="bee-img" alt="bee" />
        <div className="speech-bubble">
          <p className="typing">{currentText}</p>
          <div className="search-bar">
            <img src="/search-icon.png" className="search-icon" alt="검색 아이콘" />
            <input type="text" placeholder="Search" />
          </div>
        </div>
      </div>

      {/* ✅ 추천 질문 버튼 */}
      <div className="suggested-questions">
        <button># 수분량 부족한 작물은?</button>
        <button># 수확 가능한 작물은?</button>
      </div>

      <div className="status-box-container">
        <StatusBox type="critical" count={0} />
        <StatusBox type="warning" count={0} />
        <StatusBox type="normal" count={0} />
      </div>
    </div>
  );
}

export default HomePages;
