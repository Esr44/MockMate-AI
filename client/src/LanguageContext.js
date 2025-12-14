import React, { createContext, useState, useEffect } from 'react';
import { translations } from './translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // اللغة الافتراضية هي العربية 'ar'
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'ar');

  useEffect(() => {
    // حفظ اللغة في المتصفح وتغيير اتجاه الصفحة
    localStorage.setItem('lang', language);
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.style.textAlign = language === 'ar' ? 'right' : 'left';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // دالة لجلب النص المترجم
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};