import React, { useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes, Navigate , useLocation} from "react-router-dom";
import { BackendURL } from "./component/backendURL";
import Home from "./pages/home";
import Register from "./pages/register";
import CatUpload from "./pages/catUpload";
import CatTemplate from "./pages/catTemplate";
import ProfilePage from "./pages/profilePage";
import Login from "./pages/login";
import Footer from "./component/footer";
import "bootstrap/dist/css/bootstrap.min.css";

import Inbox from "./pages/inbox"; // Import Inbox.js
import { ResetPassword } from "./pages/resetpassword";
import { Sendtoken } from "./pages/requestingreset";
import Chatbox from "./component/chatbox";
import PaymentPage from "./component/PaymentForm";
import { Context } from "./store/appContext";
import { Navbar } from "./component/navbar";
import "../styles/layout.css";
import ApplicationPage from "./pages/applicationPage";


const ChatboxWrapper = ()=>{
  const location = useLocation();
  const {store} = useContext(Context);

  if (location.pathname === "/inbox" ) {
    return null;
  }

  return store.token ? <Chatbox /> : null;
};
const Layout = () => {
  const { store, actions } = useContext(Context);
  const basename = process.env.BASENAME || "";

  useEffect(() => {
    actions.getBreeds();

    actions.getUserProfile(sessionStorage.token); // Ensure user profile is fetched if token exists
    if (actions.getUserProfile() === "")
      actions.getMessages(data.user.id)


  }, [actions]);

  // Ensure the backend URL is configured
  if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") {
    return <BackendURL />;
  }

  return (
    <div className="app-layout">
      <BrowserRouter basename={basename}>
        <div className="layout-container">
        <ChatboxWrapper />
          {/* <Sidebar /> Sidebar component always visible */}

          {/* Display Chatbox only if user is logged in */}
      
      
     

          <main className="main-content">
            <Navbar></Navbar>
            <Routes>
              <Route index element={<Home />} />

              {/* Protected route for logged-in users */}
              <Route
                path="/profile"
                element={store.token ? <ProfilePage /> : <Navigate to="/login" />}
              />

              {/* Routes for all pages */}
              <Route path="/cat-template/:id" element={<CatTemplate />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cat-upload" element={<CatUpload />} />
              <Route path="/login" element={<Login />} />
              <Route path="/application" element={<ApplicationPage />} />
              <Route path="/requesting-reset" element={<Sendtoken />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/payment" element={<PaymentPage />} />

              {/* New route for Inbox page */}
              <Route
                path="/inbox"
                element={store.token ? <Inbox /> : <Navigate to="/login" />}
              />

              {/* Fallback for undefined routes */}
              <Route path="*" element={<h1>Page Not Found</h1>} />
            </Routes>
            <Footer></Footer>
          </main>
        </div>

      </BrowserRouter>
    </div>
  );
};

export default Layout;
