// src/pages/HomePages.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import StatusBox from '../components/StatusBox';
import '../App.css'; // 스타일은 여기에 합쳐도 되고 나중에 분리해도 돼

function HomePages() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="home-container">
      <img src="/background.jpg" alt="background" className="background-img" />

      {/* 헤더 컴포넌트: 로고 + 로그인 버튼 */}
      <Header onLoginClick={() => setShowLogin(true)} />

      {/* 로그인 모달 */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {/* 회원가입 모달 */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      {/* 검색창 + 벌꿀 묶음 */}
<div className="search-wrapper">
  <div className="search-group">
    <div className="search-bar">
      <img src="/search-icon.png" className="search-icon" alt="검색 아이콘" />

      <input type="text" placeholder="Search" />
    </div>
    <img src="/bee.png" className="bee-img" alt="" />
  </div>
</div>



      {/* 해시태그 설명 */}
      <p className="hashtag"># 오늘 상추 상태는 어때? &nbsp; # 토마토 수확은 언제쯤 가능해?</p>

      {/* 꿀벌 이미지 */}
      <img src="/bee.png" alt="bee" className="bee-img" />

      {/* 상태 박스들 */}
      <div className="status-box-container">
        <StatusBox type="critical" count={0} />
        <StatusBox type="warning" count={0} />
        <StatusBox type="normal" count={0} />
      </div>
    </div>
  );
}

export default HomePages;
