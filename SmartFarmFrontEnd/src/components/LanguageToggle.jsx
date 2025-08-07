import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageToggle.css';

function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const handleToggle = () => {
    i18n.changeLanguage(isEnglish ? 'ko' : 'en');
  };

  return (
    <div
      className={`lang-toggle-switch ${isEnglish ? 'english' : 'korean'}`}
      onClick={handleToggle}
      tabIndex={0}
      aria-label="언어 토글"
      onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && handleToggle()}
    >
      <div className="lang-toggle-knob" />
      <div className="lang-toggle-labels">
        <span className="lang-label kr">KR</span>
        <span className="lang-label eng">EN</span>
      </div>
    </div>
  );
}

export default LanguageToggle;
