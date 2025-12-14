import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import { useToast } from './ToastContext'; // 👈 استدعاء الأداة

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { t, language, toggleLanguage } = useContext(LanguageContext);
  const { addToast } = useToast(); // 👈 تفعيل الأداة

  const isLoggedIn = localStorage.getItem('token');
  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleSmartHomeClick = () => {
    if (isLoggedIn) {
      navigate('/interview');
    } else {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/');
    
    // 👇👇 رسالة خروج أنيقة بدلاً من alert 👇👇
    const msg = language === 'ar' ? "تم تسجيل الخروج بنجاح 👋" : "Logged out successfully 👋";
    addToast(msg, 'success'); 
  };

  return (
    <nav className="navbar">
      <div 
        className="logo" 
        onClick={handleSmartHomeClick} 
        style={{ cursor: 'pointer' }}
        title={isLoggedIn ? t('backInterview') : t('home')}
      >
        MockMate AI 🤖
      </div>

      <div className="nav-links">
        <a onClick={handleSmartHomeClick} className={isActive('/')} style={{cursor:'pointer'}}>
          {t('home')}
        </a>
        <a onClick={() => handleNavClick('/about')} className={isActive('/about')} style={{cursor:'pointer'}}>{t('about')}</a>
        <a onClick={() => handleNavClick('/features')} className={isActive('/features')} style={{cursor:'pointer'}}>{t('features')}</a>
        <a onClick={() => handleNavClick('/developers')} className={isActive('/developers')} style={{cursor:'pointer'}}>{t('devTeamTitle')}</a>
        <a onClick={() => handleNavClick('/contact')} className={isActive('/contact')} style={{cursor:'pointer'}}>{t('contact')}</a>
      </div>

      <div className="nav-buttons">
        <button onClick={toggleLanguage} className="btn-nav" style={{fontSize: '14px'}}>
          {language === 'ar' ? '🇬🇧 English' : '🇸🇦 عربي'}
        </button>

        {isLoggedIn ? (
          <>
            <button onClick={() => navigate('/dashboard')} className="btn-nav register" style={{background: '#667eea'}}>
              ⚙️ {t('settings')}
            </button>
            <button onClick={handleLogout} className="btn-nav login" style={{background: '#e53e3e', borderColor: '#e53e3e'}}>
              🚪 {t('logout')}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')} className="btn-nav login">{t('login')}</button>
            <button onClick={() => navigate('/register')} className="btn-nav register">{t('register')}</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;