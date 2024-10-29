import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const { actions } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage(null);

    const response = await actions.loginUser({ email, password });
    if (response.success) {
      toggleSidebar();  // Close the sidebar upon successful login
      navigate("/");    // Redirect to homepage or any other page
    } else {
      setErrorMessage(response.message);  // Display error message if login fails
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={toggleSidebar}>
        &times;
      </button>
      <h2>Menu</h2>

      {/* Registration Button */}
      <button className="sidebar-btn btn btn-primary" onClick={() => navigate("/register")}>
        Register
      </button>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="login-form">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-control"
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-control"
        />

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        
        <button type="submit" className="login-btn btn btn-success">
          Login
        </button>
      </form>
    </div>
  );
};

export default Sidebar;
