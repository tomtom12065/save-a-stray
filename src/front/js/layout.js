import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BackendURL } from "./component/backendURL";
import Home from "./pages/home";
import Register from "./pages/register";
import CatUpload from "./pages/catUpload";
import CatTemplate from "./pages/catTemplate";
import ProfilePage from "./pages/profilePage";
import Login from "./pages/login";
import { ResetPassword } from "./pages/resetpassword";
import { Sendtoken } from "./pages/requestingreset";
import Sidebar from "./component/sidebar";
import { Context } from "./store/appContext";  // Assuming you have a Context for global state
import "../styles/layout.css"
const Layout = () => {
  const { actions } = useContext(Context);
  const basename = process.env.BASENAME || "";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); 
  // Check if user is logged in by checking localStorage for the token
  useEffect(() => {
    const token = localStorage.getItem("token");  // Retrieve token from localStorage
    const storedUser = localStorage.getItem("user");  // Retrieve user info from localStorage
    actions.getUserProfile();
  }, [actions]);

  // Ensure the backend URL is configured
  if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") {
    return <BackendURL />;
  }

  return (
    <div className="app-layout">
      <BrowserRouter basename={basename}>
      <div className="layout-container">
      <Sidebar /> {/* Sidebar component always visible */}
        
        <main className="main-content">
          <Routes>
            <Route index element={<Home />} />

            {/* Protected route for logged-in users */}
            {isLoggedIn ? (
              <Route path="/profile" element={<ProfilePage/>} />
            ) : (
              <Route path="/your-cats" element={<Login />} />
            )}

            <Route path="/cat-template/:id" element={<CatTemplate />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cat-upload" element={<CatUpload />} />
            <Route path="/login" element={<Login />} />
            <Route path="/requesting-reset" element={<Sendtoken />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<h1>Not found!</h1>} />
          </Routes>
        </main>
      </div>
      
      </BrowserRouter>
    </div>
  );
};

export default Layout;
