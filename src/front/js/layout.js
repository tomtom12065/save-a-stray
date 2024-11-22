// layout.js
import React, { useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
import { Context } from "./store/appContext";
import "../styles/layout.css";

const Layout = () => {
  const { store, actions } = useContext(Context);
  const basename = process.env.BASENAME || "";

  useEffect(() => {
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
              <Route
                path="/profile"
                element={store.token ? <ProfilePage /> : <Navigate to="/login" />}
              />

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
