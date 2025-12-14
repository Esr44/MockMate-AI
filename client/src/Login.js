import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import { useToast } from './ToastContext'; // 👈 استدعاء

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useContext(LanguageContext);
  const { addToast } = useToast(); // 👈 تفعيل

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://mockmate-ai-cmii.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);
        
        // 👇 رسالة نجاح ناعمة 👇
        addToast(language === 'ar' ? "تم تسجيل الدخول بنجاح 🔓" : "Logged in successfully 🔓", 'success');
        
        navigate('/interview'); 
      } else {
        // 👇 رسالة خطأ ناعمة 👇
        addToast(data.message, 'error');
      }
    } catch (error) {
      addToast("Failed to connect to server", 'error');
    }
  };

  return (
    <div className="container-center pop-enter">
      <div className="glass-card">
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
           <button onClick={toggleLanguage} className="btn-nav" style={{fontSize: '14px'}}>
            {language === 'ar' ? '🇬🇧 English' : '🇸🇦 عربي'}
          </button>
        </div>

        <h2 style={{textAlign: 'center', marginBottom: '30px', color: '#4a5568'}}>{t('loginTitle')}</h2>
        
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            name="email"
            autoComplete="email"
            placeholder={t('email')} 
            className="input-field"
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          
          <input 
            type="password" 
            name="password"
            autoComplete="current-password"
            placeholder={t('password')} 
            className="input-field"
            onChange={e => setPassword(e.target.value)} 
            required 
          />

          <div style={{textAlign: 'end', marginTop: '5px'}}> 
            <span 
              onClick={() => navigate('/forgot-password')} 
              style={{color: '#667eea', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold'}}
            >
              {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </span>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{marginTop: '20px'}}>
            {t('enterBtn')}
          </button>
        </form>
        
        <p style={{marginTop: '20px', textAlign: 'center'}}>
          {t('noAccount')} <span onClick={() => navigate('/register')} className="link">{t('createAccount')}</span>
        </p>
      </div>
    </div>
  );
}

export default Login;