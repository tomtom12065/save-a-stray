// Login.js
// backend/3001 : onRender
// frontend/3000: vercel, netlify
// database: locally, onRender(30days), Amazon AWS (1 year free), Microsoft Azure, (Firebase)
// database: locally, onRender(30days), Amazon AWS (1 year free), Microsoft Azure, (Firebase)
// for these ill have to download
// psql: postresql






import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";

const Login = () => {
  const { actions } = useContext(Context);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
// allow login with username or email
// adjust route to accept either
// 
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const response = await actions.loginUser({ username, password });

    if (response.success) {
      navigate("/"); // Redirect to home on success
    } else {
      setError(response.message); // Display error message
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {/* {error && <p className="error">{error}</p>} */}
      <form onSubmit={handleSubmit}>
        <label>username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
