import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { LanguageContext } from './LanguageContext';
import { useToast } from './ToastContext'; // 👈 استدعاء نظام الإشعارات

function Interview() {
  const navigate = useNavigate(); 
  const { t, language } = useContext(LanguageContext);
  const { addToast } = useToast(); // 👈 تفعيل الإشعارات

  // 👇 الحفاظ على المتغيرات الخاصة بك
  const [messages, setMessages] = useState([
    { sender: 'bot', text: language === 'ar' ? 'أهلاً بك! يرجى رفع سيرتك الذاتية (PDF)' : 'Welcome! Please upload your CV (PDF).' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const fileInputRef = useRef(null);

  // دالة الخروج (مع التوست الجديد)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/'); 
    addToast(language === 'ar' ? "تم تسجيل الخروج 👋" : "Logged out 👋", 'success');
  };

  // دالة إنهاء المقابلة (مع التصميم الجديد)
  const handleEndInterview = async () => {
    if (messages.length < 3) { 
        // 👇 استبدال alert بـ toast
        addToast(t('interviewShort') || (language === 'ar' ? "المقابلة قصيرة جداً!" : "Interview too short!"), 'error'); 
        return; 
    }
    
    setIsGeneratingReport(true);
    const chatHistory = messages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }));
    
    try {
      const response = await fetch('http://localhost:5000/end-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: chatHistory, lang: language }),
      });
      const data = await response.json();
      setReportContent(data.report);
      setShowReport(true);
      addToast(language === 'ar' ? "تم إنشاء التقرير بنجاح 📊" : "Report generated successfully 📊", 'success');
    } catch (error) { 
        addToast("Error generating report", 'error'); 
    } finally { 
        setIsGeneratingReport(false); 
    }
  };

  // دالة الاستماع (المايكروفون)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { 
        addToast("Browser not supported", 'error'); 
        return; 
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    recognition.interimResults = true;
    setIsListening(true);
    recognition.start();
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
      setInput(transcript);
    };
    
    recognition.onerror = () => {
        setIsListening(false);
        // addToast("Microphone error", 'error'); // اختياري
    };
    recognition.onend = () => setIsListening(false);
  };

  // دالة رفع الملفات
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: `📎 ${file.name}` }]);
    setMessages(prev => [...prev, { sender: 'bot', text: t('analyzing') }]); // ⏳ جاري التحليل
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', language);
    
    try {
      const response = await fetch('http://localhost:5000/upload-cv', { method: 'POST', body: formData });
      const data = await response.json();
      // حذف رسالة "جاري التحليل" القديمة وإضافة الرد
      setMessages(prev => prev.filter(msg => msg.text !== t('analyzing')));
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      addToast(language === 'ar' ? "تم تحليل السيرة الذاتية ✅" : "CV Analyzed ✅", 'success');
    } catch { 
        setMessages(prev => [...prev, { sender: 'bot', text: "Error analyzing CV" }]); 
        addToast("Error uploading file", 'error');
    }
    setIsLoading(false);
  };

// دالة الإرسال (الشات) المعدلة والمضمونة 100%
  const handleSend = async () => {
    // 1. التأكد أن النص ليس فارغاً
    if (input.trim() === '') return;
    
    // 2. 🛑 حفظ الرسالة في متغير منفصل قبل مسحها من الشاشة
    const userMessage = input; 
    
    // 3. تحديث الشاشة فوراً (إظهار رسالة المستخدم)
    const newMessages = [...messages, { sender: 'user', text: userMessage }];
    setMessages(newMessages);
    
    // 4. مسح حقل الكتابة وإظهار حالة الكتابة
    setInput('');
    setIsLoading(true);
    
    // 5. تجهيز تاريخ المحادثة
    const chatHistory = newMessages.map(msg => ({ 
        role: msg.sender === 'user' ? 'user' : 'assistant', 
        content: msg.text 
    }));
    
    try {
      // 6. الإرسال للسيرفر (نرسل userMessage المحفوظ وليس input الفارغ)
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: userMessage, // 👈 هنا السر: نرسل المتغير المحفوظ
            history: chatHistory, 
            lang: language 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // 7. إضافة رد الروبوت
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        throw new Error("Server error");
      }
      
    } catch (error) { 
        // في حالة الخطأ، نضيف رسالة خطأ للمحادثة وتنبيه
        setMessages(prev => [...prev, { sender: 'bot', text: language === 'ar' ? "عذراً، حدث خطأ في الاتصال." : "Sorry, connection error." }]); 
        addToast("Connection Error", 'error');
    }
    
    setIsLoading(false);
  };

  return (
    // 👇 استخدام كلاس pop-enter للظهور الناعم
    <div className="container-center pop-enter" style={{maxWidth: '900px', height: '85vh', marginTop: '20px'}}>
      
      {/* 📊 نافذة التقرير (Modal) */}
      {showReport && (
        <div className="modal-overlay">
          <div className="glass-card" style={{maxWidth:'80%', maxHeight:'80%', overflowY:'auto', background:'rgba(255,255,255,0.95)'}}>
            <h2 style={{color:'#28a745', textAlign:'center', borderBottom:'1px solid #ddd', paddingBottom:'10px'}}>
                {t('reportTitle')} 📊
            </h2>
            <div style={{
                background:'#f8f9fa', padding:'20px', borderRadius:'10px', lineHeight:'1.8', 
                whiteSpace:'pre-line', direction: language==='ar'?'rtl':'ltr', textAlign: language==='ar'?'right':'left',
                maxHeight: '400px', overflowY: 'auto'
            }}>
              {reportContent}
            </div>
            <div style={{display:'flex', gap:'10px', marginTop:'20px', justifyContent: 'center'}}>
              <button onClick={() => setShowReport(false)} className="btn btn-secondary">{t('close')}</button>
              <button onClick={() => window.location.reload()} className="btn btn-primary">{t('newInterview')}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* ⏳ شاشة الانتظار (Loading Overlay) */}
      {isGeneratingReport && (
        <div className="modal-overlay">
           <div className="glass-card" style={{textAlign: 'center'}}>
             <div style={{fontSize: '40px', marginBottom: '10px'}}>🤖</div>
             <h3>{t('analyzing')}</h3>
             <p className="loading-text">Writing detailed report...</p>
           </div>
        </div>
      )}

      {/* 🎨 الكرت الأساسي للمحادثة */}
      <div className="glass-card" style={{height: '100%', display: 'flex', flexDirection: 'column', padding: '0'}}>
        
        {/* رأس المحادثة */}
        <div style={{
            padding: '15px 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', 
            display:'flex', justifyContent:'space-between', alignItems:'center', background: 'rgba(255,255,255,0.4)'
        }}>
           <div style={{display:'flex', gap:'10px'}}>
              {/* أزرار التحكم */}
              <button onClick={handleLogout} className="btn btn-secondary" style={{width:'auto', padding:'8px 12px', fontSize:'12px', background:'#e53e3e', color:'white'}}>
                 🚪 {t('logout')}
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{width:'auto', padding:'8px 12px', fontSize:'12px'}}>
                 ⚙️
              </button>
           </div>
           
           <h3 style={{margin:0, color:'#4a5568'}}>MockMate AI 🤖</h3>
           
           <button onClick={handleEndInterview} className="btn" style={{background:'#d53f8c', color:'white', width:'auto', fontSize:'14px', padding: '8px 15px'}}>
              {t('endInterview')} 🏁
           </button>
        </div>

        {/* منطقة الرسائل (Chat Box) */}
        <div className="chat-box" style={{
            flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px'
        }}>
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'ai'}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
              <div className="chat-bubble ai">
                  <span className="loading-text">...</span>
              </div>
          )}
        </div>

        {/* منطقة الإدخال (Input Area) */}
        <div className="input-area" style={{
            padding: '15px', background: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(0,0,0,0.1)',
            display: 'flex', gap: '10px', alignItems: 'center'
        }}>
           {/* زر رفع الملف مخفي */}
           <input type="file" accept="application/pdf" style={{display:'none'}} ref={fileInputRef} onChange={handleFileUpload} />
           
           {/* زر المشبك */}
           <button onClick={() => fileInputRef.current.click()} className="btn btn-secondary" style={{width:'45px', height:'45px', padding:0, borderRadius:'50%'}} title="Upload CV">
             📎
           </button>
           
           {/* حقل الكتابة */}
           <input 
             type="text" 
             value={input} 
             onChange={(e) => setInput(e.target.value)} 
             placeholder={isListening ? t('listening') : t('typeReply')} 
             className="input-field" 
             style={{margin:0, borderRadius: '25px', padding: '10px 20px'}}
             onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
           />
           
           {/* زر المايك */}
           <button 
             onClick={startListening} 
             className={`btn ${isListening ? 'recording' : 'btn-primary'}`}
             style={{
                 width:'45px', height:'45px', padding:0, borderRadius:'50%', 
                 background: isListening ? '#e53e3e' : '', 
                 animation: isListening ? 'pulse 1.5s infinite' : 'none'
             }}
           >
             {isListening ? '⏹️' : '🎙️'}
           </button>
           
           {/* زر الإرسال */}
           <button onClick={handleSend} className="btn btn-primary" style={{width:'45px', height:'45px', padding:0, borderRadius:'50%'}}>
             🚀
           </button>
        </div>

      </div>
    </div>
  );
}

export default Interview;