import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Check if the user is logged in based on the token presence
  const isLoggedIn = !!store.token;

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage(null);

    const response = await actions.loginUser({ email, password });
    if (response.success) {
      toggleSidebar();
      navigate("/");
    } else {
      setErrorMessage(response.message);
    }
  };

  const handleLogout = () => {
    actions.logout();
    navigate("/login");
    toggleSidebar();
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setErrorMessage(null);

    const response = await actions.register_user({ email, password, username });
    if (response.success) {
      const loginResponse = await actions.loginUser({ email, password });
      if (loginResponse.success) {
        toggleSidebar();
        navigate("/");
      } else {
        setErrorMessage("Registration successful, but automatic login failed.");
      }
    } else {
      setErrorMessage(response.message);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={toggleSidebar}>
        &times;
      </button>
      <h2>Menu</h2>

      {isLoggedIn ? (
        <>
          <button
            className="sidebar-btn btn btn-primary mb-3"
            onClick={() => navigate("/cat-upload")}
          >
            Upload a Cat
          </button>

          <button
            className="sidebar-btn btn btn-secondary mb-3"
            onClick={() => navigate("/your-cats")}
          >
            Your Cats
          </button>

          <button className="sidebar-btn btn btn-primary" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            className="sidebar-btn btn btn-primary"
            onClick={() => setShowRegister(!showRegister)}
          >
            {showRegister ? "Back to Login" : "Register"}
          </button>

          {showRegister ? (
            <form onSubmit={handleRegister} className="register-form mt-3">
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-control mb-2"
              />

              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control mb-2"
              />

              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control mb-3"
              />

              {errorMessage && (
                <p className="error-message text-danger">{errorMessage}</p>
              )}

              <button type="submit" className="btn btn-success w-100">
                Submit
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="login-form mt-3">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control mb-2"
              />

              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control mb-3"
              />

              {errorMessage && (
                <p className="error-message text-danger">{errorMessage}</p>
              )}

              <button type="submit" className="login-btn btn btn-success w-100">
                Login
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;
