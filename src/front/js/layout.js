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
    // Retrieve the token from localStorage
    const token = localStorage.getItem("token");
    console.log("🔍 [useEffect] Token from localStorage:", token);
  
    // Call getUserData with the token
    if (token) {
      console.log("🛠️ [useEffect] Calling actions.getUserData with token:", token);
      actions.getUserData(token);
    } else {
      console.error("🚫 [useEffect] No token found. Please log in.");
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


            <Route path="/your-cats" element={<YourCats />} />

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
