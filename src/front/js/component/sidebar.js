import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);

  // Logout handler
  const handleLogout = () => {
    actions.logout();
    toggleSidebar();  // Close sidebar after logging out
    navigate("/");
  };

  // Navigate to the reset password request page
  const handlePasswordResetRequest = () => {
    toggleSidebar();  // Close sidebar after navigation
    navigate("/requesting-reset");
  };

  // Navigate to the upload cat page
  const handleUploadCat = () => {
    toggleSidebar();  // Close sidebar after navigation
    navigate("/cat-upload");
  };

  // Navigate to the login page
  const handleLogin = () => {
    actions.loginUser
    toggleSidebar();  // Close sidebar after navigation
    navigate("/login");
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={toggleSidebar}>&times;</button>
      <h2>Menu</h2>

      {/* Conditional buttons for not logged-in users */}
      {!store.user ? (
        <>
          <button className="sidebar-btn btn btn-primary" onClick={handleLogin}>
            Login
          </button>
          <button className="sidebar-btn btn btn-secondary mt-2" onClick={() => navigate("/register")}>
            Register
          </button>
          <button className="sidebar-btn btn btn-secondary mt-2" onClick={handlePasswordResetRequest}>
            Forgot Password?
          </button>
        </>
      ) : (
        // Conditional buttons for logged-in users
        <>
          <button className="sidebar-btn btn btn-primary" onClick={() => navigate("/profile")}>
            View your profile
          </button>
          <button className="sidebar-btn btn btn-success mt-2" onClick={handleUploadCat}>
            Upload Cat
          </button>
          <button className="sidebar-btn btn btn-secondary mt-2" onClick={handleLogout}>
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Sidebar;
