import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getMe } from "../../services/SSO/auth";
import LOGO_2 from "../../assets/LOGO_1.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleLogin = async () => {
    try {
      await login(username, password);
      const user = await getMe();

      if (user.role === "reviewer") {
        navigate("/ScoreBack");
      } else {
        // admin 或 user 都導向 /back
        navigate("/back");
      }
    } catch {
      alert("登入失敗");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src={LOGO_2} alt="Logo" />
        <h1>2025技優成果競賽</h1>
        <h2>Single Sign On</h2>
        <input
          placeholder="帳號"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="密碼"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>登入</button>
        <p className="Copyright">
          Copyright © {currentYear} I-Hsiang. All rights reserved.
        </p>
      </div>
    </div>
  );
}
