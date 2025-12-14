import React, { createContext, useState, useContext } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    // إضافة الإشعار للقائمة
    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);

    // إخفاء الإشعار تلقائياً بعد 3 ثواني
    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* هذا هو المكان الذي ستظهر فيه الإشعارات */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-notification ${toast.type}`}>
            <span style={{ fontSize: '18px' }}>
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// دالة نستخدمها في الصفحات لاستدعاء الإشعار
export const useToast = () => useContext(ToastContext);