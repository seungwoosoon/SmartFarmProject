// src/components/Header.jsx
import { useNavigate } from 'react-router-dom';

function Header({ isLoggedIn, onLoginClick, onLogout, currentPage }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="header">
      <img
        src="/logo.png"
        alt="logo"
        className="logo"
        onClick={handleLogoClick}
      />

      {isLoggedIn ? (
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* 🔥 MyFarm 버튼은 현재 페이지가 myfarm이 아닐 때만 표시 */}
          {currentPage !== 'myfarm' && (
            <button className="icon-btn" onClick={() => navigate('/myfarm')}>
              <img src="/myfarm-icon.png" alt="My Farm" className="nav-icon" />
            </button>
          )}
          <button className="login-btn" onClick={() => navigate('/mypage')}>
            My Page
          </button>
          <button className="login-btn" onClick={onLogout}>
            LOG OUT
          </button>
        </div>
      ) : (
        <button className="login-btn" onClick={onLoginClick}>
          LOG IN
        </button>
      )}
    </div>
  );
}

export default Header;
