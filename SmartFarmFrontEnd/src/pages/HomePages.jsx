// src/pages/HomePages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import StatusBox from '../components/StatusBox';
import ChatBot from '../components/ChatBot'; // 답변 모달 컴포넌트
import { logout } from '../api/auth';
import '../App.css';

function getBotAnswer(query, t) {
  const norm = (query ?? '').trim().toLowerCase();

  const moistureKey = t('question.moisture').toLowerCase();
  const harvestKey = t('question.harvest').toLowerCase();
  const siteExplainBtnKey = t('siteExplainBtn').toLowerCase();

  if (norm === moistureKey || norm.includes('moisture')) {
    return t('moisture');
  }
  if (norm === harvestKey || norm.includes('harvest')) {
    return t('harvest');
  }
  if (norm === siteExplainBtnKey || norm === '사이트 설명해줘' || norm === 'explain the site') {
    return t('siteExplain');
  }
  return t('default');
}

function HomePages() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const typingTextRef = useRef([t('typing.question1'), t('typing.question2')]);
  const navigate = useNavigate();

  // 챗봇 상태 관리
  const [input, setInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatAnswer, setChatAnswer] = useState('');

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

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
          setCurrentText('');
          setTimeout(() => {
            typingInterval = setInterval(typeNextChar, 100);
          }, 300);
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

  // 검색 제출 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;
    setChatAnswer(getBotAnswer(query, t));
    setChatOpen(true);
    setInput('');
  };

  // 추천 질문 클릭 핸들러
  const handleReco = (txt) => {
    setChatAnswer(getBotAnswer(txt, t));
    setChatOpen(true);
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

      {/* 말풍선 + 검색바(타이핑 효과 포함) - 추천 질문 버튼은 안에 없음 */}
      <div className="bee-and-bubble">
        <img src="/bee.png" className="bee-img" alt={t('alt.bee')} />
        <div className="speech-bubble">
          <p className="typing">{currentText}</p>

          {/* 검색 입력창 */}
          <form className="search-bar" onSubmit={handleSearch} aria-label="챗봇 질문 입력폼">
            <img src="/search-icon.png" className="search-icon" alt={t('alt.search')} />
            <input
              type="text"
              placeholder={t('placeholder.search')}
              value={input}
              onChange={e => setInput(e.target.value)}
              aria-label="챗봇 질문 입력창"
            />
          </form>
        </div>
      </div>

      {/* 추천 질문 버튼 영역 - 말풍선 밖, 기존 위치/디자인 서식 유지 */}
      <div className="suggested-questions" style={{ marginTop: '16px' }}>
        <button onClick={() => handleReco(t('question.moisture'))}>{t('question.moisture')}</button>
        <button onClick={() => handleReco(t('question.harvest'))}>{t('question.harvest')}</button>
        <button onClick={() => handleReco(t('siteExplainBtn'))}>{t('siteExplainBtn')}</button>
      </div>

      {/* 답변 모달 */}
      <ChatBot open={chatOpen} answer={chatAnswer} onClose={() => setChatOpen(false)} />

      <div className="status-box-container">
        <StatusBox type="critical" count={0} />
        <StatusBox type="warning" count={0} />
        <StatusBox type="normal" count={0} />
      </div>
    </div>
  );
}

export default HomePages;
