import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

function Features() {
  const { t } = useContext(LanguageContext);
  return (
    <div className="page-container page-enter">
      <h2 className="section-title">{t('features')} ✨</h2>
      <div className="features-grid">
        <div className="feature-card">
          <div className="icon">🎙️</div>
          <h3>{t('feat1Title')}</h3>
          <p>{t('feat1Desc')}</p>
        </div>
        <div className="feature-card">
          <div className="icon">📊</div>
          <h3>{t('feat2Title')}</h3>
          <p>{t('feat2Desc')}</p>
        </div>
        <div className="feature-card">
          <div className="icon">🔒</div>
          <h3>{t('feat3Title')}</h3>
          <p>{t('feat3Desc')}</p>
        </div>
      </div>
    </div>
  );
}
export default Features;