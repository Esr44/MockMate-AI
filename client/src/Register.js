import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';
import { useToast } from './ToastContext';

function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // 👇 حالة جديدة للتحكم في ظهور النافذة المنبثقة
  const [showModal, setShowModal] = useState(false); 

  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useContext(LanguageContext);
  const { addToast } = useToast(); 

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (step === 1) handleRequestCode();
    else handleRegister();
  };

  const handleRequestCode = async () => {
    if(!email || !password) { 
      addToast(language === 'ar' ? "يرجى ملء البيانات" : "Please fill all fields", 'error'); 
      return; 
    }

    if (!isPasswordValid) {
      addToast(language === 'ar' ? "⚠️ كلمة المرور ضعيفة!" : "⚠️ Password is too weak!", 'error');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (response.ok) {
        addToast(t('alertCodeSent'), 'success');
        setStep(2);
      } else {
        if (data.message === "EMAIL_EXISTS") {
          // 👇 هنا التغيير: بدلاً من window.confirm، نفتح النافذة الخاصة بنا
          setShowModal(true); 
        } else {
          addToast(data.message || "Error sending code", 'error');
        }
      }
    } catch (error) { addToast("Error connecting server", 'error'); }
  };

  const handleRegister = async () => {
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, code }),
    });
    const data = await response.json();
    if (response.ok) {
      addToast(t('alertSuccess'), 'success');
      navigate('/login');
    } else { addToast(data.message, 'error'); }
  };

  return (
    <div className="container-center pop-enter">
      
      {/* 👇👇 كود النافذة المنبثقة الزجاجية (تظهر فقط عند الحاجة) 👇👇 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{fontSize: '50px', marginBottom: '10px'}}>⚠️</div>
            <h3 style={{color: '#2d3748', marginBottom: '10px'}}>
              {language === 'ar' ? 'تنبيه مهم' : 'Important Notice'}
            </h3>
            <p style={{color: '#718096', fontSize: '16px'}}>
              {language === 'ar' 
                ? "هذا البريد الإلكتروني مسجل مسبقاً! هل تود الانتقال لصفحة الدخول؟" 
                : "This email is already registered! Do you want to go to Login?"}
            </p>
            <div className="modal-buttons">
              <button 
                onClick={() => navigate('/login')} 
                className="btn btn-primary"
              >
                {language === 'ar' ? 'نعم، دخول ✅' : 'Yes, Login ✅'}
              </button>
              <button 
                onClick={() => setShowModal(false)} 
                className="btn btn-secondary"
                style={{background: '#e2e8f0', color: '#4a5568'}}
              >
                {language === 'ar' ? 'لا، إلغاء ❌' : 'No, Cancel ❌'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 👆👆 نهاية النافذة المنبثقة 👆👆 */}


      <div className="glass-card">
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
           <button onClick={toggleLanguage} className="btn-nav" style={{fontSize: '14px'}}>
            {language === 'ar' ? '🇬🇧 English' : '🇸🇦 عربي'}
          </button>
        </div>

        <h2 style={{textAlign: 'center', marginBottom: '30px', color: '#2d3748'}}>{t('registerTitle')}</h2>

        <form onSubmit={handleFormSubmit}>
          {step === 1 && (
            <>
              <input type="email" placeholder={t('email')} className="input-field" onChange={e => setEmail(e.target.value)} required />
              
              <input 
                type="password" 
                placeholder={t('password')} 
                className="input-field" 
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setIsFocused(true)} 
                required 
              />

              {(isFocused || password.length > 0) && (
                <div className="password-rules">
                  <div className={`rule-item ${hasLength ? 'valid' : ''}`}>
                    {hasLength ? '✅' : '○'} {language === 'ar' ? '8 خانات على الأقل' : 'At least 8 chars'}
                  </div>
                  <div className={`rule-item ${hasUpper ? 'valid' : ''}`}>
                    {hasUpper ? '✅' : '○'} {language === 'ar' ? 'حرف كبير (A-Z)' : 'Uppercase letter (A-Z)'}
                  </div>
                  <div className={`rule-item ${hasLower ? 'valid' : ''}`}>
                    {hasLower ? '✅' : '○'} {language === 'ar' ? 'حرف صغير (a-z)' : 'Lowercase letter (a-z)'}
                  </div>
                  <div className={`rule-item ${hasNumber ? 'valid' : ''}`}>
                    {hasNumber ? '✅' : '○'} {language === 'ar' ? 'رقم واحد على الأقل (0-9)' : 'At least one number'}
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{marginTop:'15px', opacity: isPasswordValid ? 1 : 0.7}}
              >
                {t('sendCode')}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{color: '#28a745', textAlign: 'center', fontWeight: 'bold'}}>{t('codeSent')} {email} ✅</p>
              <input type="text" placeholder={t('enterCode')} className="input-field" onChange={e => setCode(e.target.value)} required />
              <button type="submit" className="btn btn-primary" style={{marginTop:'15px'}}>{t('confirmRegister')}</button>
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{marginTop: '10px'}}>{t('back')}</button>
            </>
          )}
        </form>

        <p style={{marginTop: '20px', textAlign: 'center'}}>
          {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'} <span onClick={() => navigate('/login')} className="link">{t('login')}</span>
        </p>
      </div>
    </div>
  );
}

export default Register;