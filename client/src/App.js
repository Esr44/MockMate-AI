import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// استدعاء الصفحات
import Home from './Home';
import About from './About';
import Features from './Features';
import Developers from './Developers';
import Contact from './Contact';
import Login from './Login';
import Register from './Register';
import Interview from './Interview';
import Dashboard from './Dashboard';
import PrivacyPolicy from './PrivacyPolicy';
import Terms from './Terms';
import ForgotPassword from './ForgotPassword';

// استدعاء المكونات الثابتة
import Navbar from './Navbar';
import Footer from './Footer';
import { LanguageProvider } from './LanguageContext';
import { ToastProvider } from './ToastContext'; // 👈 هام جداً: استدعاء الإشعارات
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <LanguageProvider>
      <ToastProvider> {/* 👈 هنا التغليف: عشان الإشعارات تشتغل في كل مكان */}
        <Router>
          <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            
            <Navbar /> 

            <div style={{flex: 1}}>
              <Routes>
                {/* الصفحات العامة */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/features" element={<Features />} />
                <Route path="/developers" element={<Developers />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* صفحات الدخول */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* الصفحات القانونية */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />

                {/* الصفحات الخاصة (تتطلب دخول) */}
                <Route path="/interview" element={
                  <PrivateRoute>
                    <Interview />
                  </PrivateRoute>
                } />

                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
              </Routes>
            </div>
            
            <Footer /> 
          </div>
        </Router>
      </ToastProvider> 
    </LanguageProvider>
  );
}

export default App;