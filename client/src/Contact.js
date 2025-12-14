import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

function Contact() {
  const { t, language } = useContext(LanguageContext);
  return (
    <div className="page-container page-enter">
      <h2 className="section-title">{t('contact')} 📬</h2>
      <div className="glass-card" style={{maxWidth: '600px', margin: '0 auto', textAlign: 'center'}}>
        <p style={{marginBottom: '30px', color: '#718096', fontSize: '18px'}}>
           {language === 'ar' ? 'يسعدنا جداً تواصلكم معنا 💖' : 'We would love to hear from you 💖'}
        </p>
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center'}}>
          <a href="mailto:ehhw2001@gmail.com" className="btn btn-secondary" style={{width: '100%', padding: '15px'}}>
            📧 ehhw2001@gmail.com
          </a>
          <a href="mailto:anharalswaty@gmail.com" className="btn btn-secondary" style={{width: '100%', padding: '15px'}}>
            📧 anharalswaty@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
export default Contact;