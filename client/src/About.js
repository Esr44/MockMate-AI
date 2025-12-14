import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

function About() {
  const { t } = useContext(LanguageContext);
  return (
    <div className="page-container page-enter">
      <h2 className="section-title">{t('aboutTitle')} 💡</h2>
      <div className="glass-card" style={{textAlign: 'center', marginBottom: '40px'}}>
        <p style={{fontSize: '18px', lineHeight: '1.8'}}>{t('aboutDesc')}</p>
      </div>
      <div className="features-grid">
        <div className="feature-card">
          <div className="icon">👁️</div>
          <h3>{t('visionTitle')}</h3>
          <p>{t('visionText')}</p>
        </div>
        <div className="feature-card">
          <div className="icon">🚀</div>
          <h3>{t('missionTitle')}</h3>
          <p>{t('missionText')}</p>
        </div>
        <div className="feature-card">
          <div className="icon">🎯</div>
          <h3>{t('goalTitle')}</h3>
          <p>{t('goalText')}</p>
        </div>
      </div>
    </div>
  );
}
export default About;