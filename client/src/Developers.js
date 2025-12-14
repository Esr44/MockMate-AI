import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

function Developers() {
  const { t } = useContext(LanguageContext);
  
  return (
    <div className="page-container page-enter">
      
      <h2 className="section-title">{t('devTeamTitle')} 👩‍💻</h2>

      {/* 👇👇 أولاً: كروت المطورين (أنتِ وإسراء) 👇👇 */}
      <div style={{display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '50px'}}>
        
        {/* إسراء */}
        <div className="glass-card" style={{width: '300px', padding: '30px', textAlign: 'center'}}>
          <div style={{fontSize: '60px', marginBottom: '15px', filter: 'drop-shadow(0 5px 15px rgba(213, 63, 140, 0.4))'}}>👩‍💻</div>
          
          {/* 👇 هنا التبديل: الدور أولاً ثم الاسم 👇 */}
          <p style={{color: '#d53f8c', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', letterSpacing: '1px'}}>
            {t('devRole')}
          </p> 
          <h3 style={{color: '#2d3748', margin: '0 0 15px 0', fontSize: '24px'}}>
            إسراء حسن الوجيه
          </h3>
          
          <hr style={{borderColor: '#e2e8f0', margin: '15px 0'}} />
          <p style={{fontSize: '14px', color: '#718096'}}>{t('devMajor')}</p>
          <a href="mailto:ehhw2001@gmail.com" className="btn btn-secondary" style={{marginTop: '15px', fontSize: '14px'}}>ehhw2001@gmail.com 📧</a>
        </div>

        {/* أنهار */}
        <div className="glass-card" style={{width: '300px', padding: '30px', textAlign: 'center'}}>
          <div style={{fontSize: '60px', marginBottom: '15px', filter: 'drop-shadow(0 5px 15px rgba(213, 63, 140, 0.4))'}}>👩‍💻</div>
          
          {/* 👇 هنا التبديل: الدور أولاً ثم الاسم 👇 */}
          <p style={{color: '#d53f8c', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', letterSpacing: '1px'}}>
            {t('devRole')}
          </p>
          <h3 style={{color: '#2d3748', margin: '0 0 15px 0', fontSize: '24px'}}>
            أنهار ماجد السواتي
          </h3>
          
          <hr style={{borderColor: '#e2e8f0', margin: '15px 0'}} />
          <p style={{fontSize: '14px', color: '#718096'}}>{t('devMajor')}</p>
          <a href="mailto:anharalswaty@gmail.com" className="btn btn-secondary" style={{marginTop: '15px', fontSize: '14px'}}>anharalswaty@gmail.com 📧</a>
        </div>

      </div>

      {/* 👇👇 ثانياً: بطاقة الدكتور (تحتكم) 👇👇 */}
      <div className="glass-card" style={{
        maxWidth: '600px', 
        margin: '0 auto', 
        textAlign: 'center',
        border: '1px solid rgba(214, 158, 46, 0.4)', /* إطار ذهبي خفيف */
        background: 'rgba(255, 255, 255, 0.5)' 
      }}>
        <div style={{fontSize: '30px', marginBottom: '10px'}}>🎓</div>
        <p style={{color: '#718096', marginBottom: '5px', fontSize: '14px', letterSpacing: '1px'}}>
          {t('courseReq')}
        </p>
        <h3 style={{color: '#2d3748', margin: '10px 0', fontSize: '20px'}}>
          {t('supervisedBy')}: <span style={{color: '#d69e2e', fontWeight: 'bold'}}>{t('drName')}</span>
        </h3>
      </div>

    </div>
  );
}

export default Developers;