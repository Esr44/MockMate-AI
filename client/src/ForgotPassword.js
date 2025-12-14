import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false); // للتركيز

  const navigate = useNavigate();
  const { t, language } = useContext(LanguageContext);

  // 👇👇 شروط كلمة المرور (نفس المنطق) 👇👇
  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber;

  const handleRequestCode = async (e) => {
    e.preventDefault();
    const response = await fetch('https://mockmate-ai-cmii.onrender.com/request-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (response.ok) {
      alert(language === 'ar' ? "تم إرسال الكود لإيميلك ✅" : "Code sent to your email ✅");
      setStep(2);
    } else {
      alert(language === 'ar' ? "هذا الإيميل غير مسجل لدينا ❌" : "Email not found ❌");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // 🛑 التحقق قبل الإرسال
    if (!isPasswordValid) {
      alert(language === 'ar' 
        ? "⚠️ كلمة المرور ضعيفة! يرجى اتباع الشروط." 
        : "⚠️ Password is too weak!");
      return;
    }

    const response = await fetch('https://mockmate-ai-cmii.onrender.com/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await response.json();
    if (response.ok) {
      alert(language === 'ar' ? "تم تغيير كلمة المرور بنجاح! 🥳" : "Password reset successfully! 🥳");
      navigate('/login');
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="container-center pop-enter">
      <div className="glass-card">
        <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{width: 'auto', marginBottom: '20px'}}>
          ⬅️ {language === 'ar' ? 'عودة للدخول' : 'Back to Login'}
        </button>

        <h2 style={{textAlign: 'center', color: '#2d3748'}}>
          {language === 'ar' ? '🔑 استعادة كلمة المرور' : '🔑 Reset Password'}
        </h2>

        {step === 1 && (
          <form onSubmit={handleRequestCode}>
            <p style={{textAlign: 'center', color: '#718096', marginBottom: '15px'}}>
              {language === 'ar' ? 'أدخل بريدك الإلكتروني لنرسل لك كود التحقق.' : 'Enter your email to receive a verification code.'}
            </p>
            <input 
              type="email" 
              placeholder={t('email')} 
              className="input-field" 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <button type="submit" className="btn btn-primary" style={{marginTop: '15px'}}>
              {language === 'ar' ? 'إرسال الكود 📩' : 'Send Code 📩'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <p style={{color: 'green', textAlign: 'center'}}>
              {language === 'ar' ? `تم إرسال الكود إلى ${email}` : `Code sent to ${email}`}
            </p>
            <input 
              type="text" 
              placeholder={language === 'ar' ? 'كود التحقق' : 'Verification Code'} 
              className="input-field" 
              onChange={e => setCode(e.target.value)} 
              required 
            />
            
            <input 
              type="password" 
              placeholder={language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'} 
              className="input-field" 
              onChange={e => setNewPassword(e.target.value)}
              onFocus={() => setIsFocused(true)}
              required 
            />

            {/* 👇👇 القائمة التفاعلية هنا 👇👇 */}
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

            <button type="submit" className="btn btn-primary" style={{marginTop: '15px', opacity: isPasswordValid ? 1 : 0.7}}>
              {language === 'ar' ? 'حفظ كلمة المرور الجديدة 💾' : 'Save New Password 💾'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;