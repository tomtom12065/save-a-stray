import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BackendURL } from "./component/backendURL";
import Home from "./pages/home";
import Register from "./pages/register";
import CatUpload from "./pages/catUpload";
import CatTemplate from "./pages/catTemplate";
import Login from "./pages/login";
import { ResetPassword } from "./pages/resetpassword";
import { Sendtoken } from "./pages/requestingreset";
import Sidebar from "./component/sidebar";
import { Context } from "./store/appContext";  // Assuming you have a Context for global state
import ProfilePage from "./pages/profilePage";

const Layout = () => {
  const { actions } = useContext(Context);
  const basename = process.env.BASENAME || "";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); 
  // Check if user is logged in by checking localStorage for the token
  useEffect(() => {
    const token = localStorage.getItem("token");  // Retrieve token from localStorage

    
      actions.getUserData(token);  // Trigger the login action with the stored user data

   

   } , [actions]);

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
            
              <Route path="/profile" element={<ProfilePage />} />
            

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
