// (1) Importing React and relevant hooks, as well as our global Context store
import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
// (2) Importing the CSS file for styles
import "../../styles/login.css";

// (3) Login component for user authentication
const Login = () => {
  // (4) Extracting 'actions' from our Context
  const { actions } = useContext(Context);
  // (5) Local state for username, password, and any error message
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  // (6) For navigation upon successful login
  const navigate = useNavigate();

  // (7) Handle form submission and call login action
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    // (7a) Calls an action to log the user in, which can accept either username or email
    const response = await actions.loginUser({ username, password });

    // (7b) If login successful, navigate to home, otherwise display error message
    if (response.success) {
      navigate("/");
    } else {
      setError(response.message);
    }
  };

  // (8) Render the login form
  //     Referenced by `handleSubmit` on form submission
  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
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
