import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BackendURL } from "./component/backendURL";
import Home from "./pages/home";
import Register from "./pages/register";
import CatUpload from "./pages/catUpload";
import CatTemplate from "./pages/catTemplate";
import YourCats from "./pages/yourCats";
import Login from "./pages/login";
import { ResetPassword } from "./pages/resetpassword";
import { Sendtoken } from "./pages/requestingreset";
import Sidebar from "./component/sidebar";
import { Context } from "./store/appContext";  // Assuming you have a Context for global state

const Layout = () => {
  const { actions } = useContext(Context);
  const basename = process.env.BASENAME || "";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); 
  // Check if user is logged in by checking localStorage for the token
  useEffect(() => {
    const token = localStorage.getItem("token");  // Retrieve token from localStorage
    const storedUser = localStorage.getItem("user");  // Retrieve user info from localStorage

    if (token && storedUser) {
      // If token and user data exist, we re-run the login action
      const parsedUser = JSON.parse(storedUser);
      actions.loginUser(parsedUser);  // Trigger the login action with the stored user data

   
      setUser(parsedUser);
    } else {
      setIsLoggedIn(false);  // If no token or user info, set logged-in state to false
      setUser(null);  // Reset user info
    }
  }, [actions]);

  // Ensure the backend URL is configured
  if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") {
    return <BackendURL />;
  }

  return (
    <div>
      <BrowserRouter basename={basename}>
        <Sidebar /> {/* Sidebar component always visible */}
        
        <div className="main-content">
          <Routes>
            <Route index element={<Home />} />

            {/* Protected route for logged-in users */}
            {isLoggedIn ? (
              <Route path="/your-cats" element={<YourCats />} />
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
        </div>
      </BrowserRouter>
    </div>
  );
};

export default Layout;
