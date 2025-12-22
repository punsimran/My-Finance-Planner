// src/pages/Auth.jsx
import { useState } from "react";
import AuthForm from "../components/AuthForm";
import "../styles/auth.css";
import bgImage from "../assets/auth.png";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`auth-wrapper ${darkMode ? "dark" : "light"}`}>
      {/* background blobs / bubbles */}
      <div className="bg-bubbles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="auth-card">
        <div className="auth-left">
          <div className="top-bar">
            <button
              type="button"
              className="mode-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "🌙" : "☀️"}
            </button>
          </div>

          <AuthForm isLogin={isLogin} />

          <p className="switch">
            {isLogin ? "New here? " : "Already have an account? "}
            <button
              type="button"
              className="link-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>


        <div className="auth-right"
        style={{ backgroundImage: `linear-gradient(135deg, rgba(14,165,233,0.85), rgba(30,58,138,0.9)), url(${bgImage})` }}
        >
          <h1>Finance Planner</h1>
          <p>Smart money. Smarter decisions.</p>
        </div>
      </div>
    </div>
  );
}
