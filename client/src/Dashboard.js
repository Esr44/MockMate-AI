import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';

function Dashboard() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false); // للتركيز

  const navigate = useNavigate();
  const { t, language } = useContext(LanguageContext);
  const userEmail = localStorage.getItem('userEmail');

  // 👇👇 شروط كلمة المرور 👇👇
  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // 🛑 التحقق
    if (!isPasswordValid) {
       alert(language === 'ar' ? "⚠️ كلمة المرور الجديدة ضعيفة!" : "⚠️ New password is weak!");
       return;
    }

    const response = await fetch('https://mockmate-ai-cmii.onrender.com/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, oldPassword, newPassword }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(language === 'ar' ? "تم تغيير كلمة المرور بنجاح! ✅" : "Password updated successfully! ✅");
      setOldPassword('');
      setNewPassword('');
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="container-center pop-enter">
      <div className="glass-card">
        <button onClick={() => navigate('/interview')} className="btn btn-secondary" style={{width: 'auto', marginBottom: '20px'}}>
          {t('backInterview')}
        </button>

        <h2 style={{textAlign: 'center', marginBottom: '30px', color: '#2d3748'}}>{t('dashTitle')}</h2>
        
        <div style={{marginBottom: '30px', textAlign: 'center'}}>
          <h3>{t('profile')}</h3>
          <p style={{color: '#718096'}}>{userEmail}</p>
        </div>

        <hr style={{borderColor: '#e2e8f0', marginBottom: '30px'}} />

        <h3 style={{marginBottom: '20px', color: '#4a5568'}}>{t('changePass')}</h3>
        <form onSubmit={handleChangePassword}>
          <input 
            type="password" 
            placeholder={t('currPass')} 
            className="input-field"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder={t('newPass')} 
            className="input-field"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            onFocus={() => setIsFocused(true)}
            required 
          />

          {/* 👇👇 القائمة التفاعلية في لوحة التحكم 👇👇 */}
          {(isFocused || newPassword.length > 0) && (
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

          <button type="submit" className="btn btn-primary" style={{marginTop: '10px', opacity: isPasswordValid ? 1 : 0.7}}>
            {t('saveChanges')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;