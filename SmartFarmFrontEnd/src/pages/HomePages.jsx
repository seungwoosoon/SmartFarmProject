// src/pages/HomePages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import StatusBox from '../components/StatusBox';
import { logout } from '../api/auth';
import '../App.css';

function HomePages() {
  const { t } = useTranslation();  // 번역 훅 사용
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentText, setCurrentText] = useState('');
  // 번역 키 배열로 수정 (여러 문장 토글)
  const typingTextRef = useRef([t('typing.question1'), t('typing.question2')]);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  // i18n 언어가 바뀔 때도 typingTextRef를 재설정해야 함
  useEffect(() => {
    typingTextRef.current = [t('typing.question1'), t('typing.question2')];
  }, [t]);

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
  }, [typingTextRef]);

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
      <img src="/background.jpg" alt={t('alt.background')} className="background-img" />

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

      {/* 꿀벌 + 말풍선 묶음 */}
      <div className="bee-and-bubble">
        <img src="/bee.png" className="bee-img" alt={t('alt.bee')} />
        <div className="speech-bubble">
          <p className="typing">{currentText}</p>
          <div className="search-bar">
            <img src="/search-icon.png" className="search-icon" alt={t('alt.search')} />
            <input type="text" placeholder={t('placeholder.search')} />
          </div>
        </div>
      </div>

      {/* 추천 질문 버튼 */}
      <div className="suggested-questions">
        <button>{t('question.moisture')}</button>
        <button>{t('question.harvest')}</button>
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
