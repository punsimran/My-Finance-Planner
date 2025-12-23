import React, { useState } from 'react';
import './auth.css';

const Auth = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="auth-wrapper" data-theme={isDarkMode ? 'dark' : 'light'}>
      {/* Dynamic Background Bubbles */}
      <div className="bubble bubble-1"></div>
      <div className="bubble bubble-2"></div>
      <div className="bubble bubble-3"></div>
      <div className="bubble bubble-4"></div>

      <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <div className="auth-container">
        {/* Left Side: Login Form */}
        <div className="left-panel">
          <div className="brand-header">
            <h1 className="welcome-text">Welcome Back</h1>
            <div className="logo-wrapper">
              <span className="logo-text">Trackify</span>
              <div className="logo-dot"></div>
            </div>
          </div>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label>Email or Username</label>
              <input type="text" placeholder="e.g. simran@trackify.com" />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" />
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button className="btn-primary-glow">Sign In</button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-grid">
            <button className="social-card google">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.svg" alt="google" />
              <span>Google</span>
            </button>
            <button className="social-card facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </button>
          </div>

          <p className="signup-prompt">
            New here? <span>Create an account</span>
          </p>
        </div>

        {/* Right Side: Visual Branding */}
        <div className="right-panel">
          <div className="mesh-gradient-overlay"></div>
          <div className="right-content">
            <div className="floating-icon">
               <i className="fa-solid fa-chart-line"></i>
            </div>
            <h1>Trackify</h1>
            <p>Master your finances with the world's most intuitive tracking tool.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;