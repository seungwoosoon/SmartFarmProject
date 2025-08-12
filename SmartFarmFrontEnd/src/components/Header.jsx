// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle"; // LanguageToggle 컴포넌트 임포트

function Header({ isLoggedIn, onLoginClick, onLogout }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div
      className="header"
      style={{ display: "flex", alignItems: "center", padding: "0 16px" }}
    >
      <img
        src="/logo.png"
        alt="logo"
        className="logo"
        style={{ cursor: "pointer" }}
        onClick={handleLogoClick}
      />

      {/* 네비게이션, 로그인/로그아웃, 언어 버튼을 오른쪽 정렬 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginLeft: "auto",
        }}
      >
        {isLoggedIn ? (
          <>
            <button
              className="icon-btn"
              onClick={() => navigate("/myfarm")}
              title={t("myFarm")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <img
                src="/myfarm-icon.png"
                alt={t("myFarm")}
                className="nav-icon"
              />
            </button>

            <button
              className="icon-btn"
              onClick={() => (window.location.href = "/unity")}
              title={t("plantTwin")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <img
                src="/plant-twin-icon.png"
                alt={t("plantTwin")}
                className="nav-icon"
                style={{ width: "57px", height: "57px" }} // 아이콘 크기 조절
              />
            </button>

            <button className="login-btn" onClick={() => navigate("/mypage")}>
              {t("myPage")}
            </button>

            <button className="login-btn" onClick={onLogout}>
              {t("logout")}
            </button>
          </>
        ) : (
          <button className="login-btn" onClick={onLoginClick}>
            {t("login")}
          </button>
        )}

        {/* 항상 오른쪽 끝에 위치하는 언어 토글 버튼 */}
        <LanguageToggle />
      </div>
    </div>
  );
}

export default Header;
