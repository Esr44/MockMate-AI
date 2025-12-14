import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';

function Home() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);

  return (
    <div className="page-enter"> 
      {/* Hero Section Only */}
      <header className="hero-section" style={{minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="hero-content">
          <h1>{t('heroTitle')} <br /><span className="highlight">{t('heroHighlight')}</span></h1>
          <p>{t('heroDesc')}</p>
          <button onClick={() => navigate('/register')} className="btn btn-primary cta-btn">{t('startBtn')}</button>
        </div>
      </header>
    </div>
  );
}

export default Home;