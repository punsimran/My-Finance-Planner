// src/components/AuthForm.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AuthForm({ isLogin }) {
  const { login, register } = useContext(AuthContext);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(identifier, password);
    } else {
      await register(identifier, identifier, password);
      alert("Account created");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>{isLogin ? "Sign in" : "Create account"}</h2>

      <div className="input-group">
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Username / Email / Phone"
          required
        />
      </div>

      <div className="input-group password-group">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button
          type="button"
          className="icon-btn"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      <button className="primary-btn">
        {isLogin ? "Login" : "Register"}
      </button>
    </form>
  );
}
