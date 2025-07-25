/*상단 로고, 로그인버튼(네비게이션바)*/
// src/components/Header.jsx
import { useNavigate } from 'react-router-dom';

function Header({ isLoggedIn, onLoginClick, onLogout }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/'); // 홈으로 이동
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
          <button className="login-btn" onClick={() => navigate('/myfarm')}>
            My Farm
          </button>
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



//Header.css는 만들지 않아도 되지만, 나중에 예쁘게 꾸미고 싶을 때 분리해도 좋아.

