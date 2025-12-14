import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';

function Footer() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p>© 2025-2026 {t('rights')} <strong>MockMate AI ®</strong></p>
        <div className="footer-links">
          <span onClick={() => navigate('/privacy')} className="footer-link">{t('privacy')}</span>
          <span className="separator">|</span>
          <span onClick={() => navigate('/terms')} className="footer-link">{t('terms')}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;