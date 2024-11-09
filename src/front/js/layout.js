import React, { useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { BackendURL } from "./component/backendURL";
import Register from "./pages/register";
import { Home } from "./pages/home";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import CatUpload from "./pages/catUpload";
import CatTemplate from "./pages/catTemplate";
import YourCats from "./pages/yourCats"; // Import the YourCats page
import injectContext from "./store/appContext";
import Login from "./pages/login";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import { Context } from "./store/appContext";

const Layout = () => {
  const basename = process.env.BASENAME || "";
  const { actions } = useContext(Context);

  // Ensure the backend URL is configured
  if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") {
    return <BackendURL />;
  }

  // Attempt to refresh the token on app load
  useEffect(() => {
    actions.refreshToken();
  }, [actions]);

  return (
    <div>
      <BrowserRouter basename={basename}>
   
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<Demo />} path="/demo" />
          <Route element={<Single />} path="/single/:theid" />
          <Route element={<CatTemplate />} path="/cat-template/:id" />
          <Route element={<Register />} path="/register" />
          <Route element={<CatUpload />} path="/cat-upload" />
          <Route element={<Login />} path="/login" />
          <Route element={<YourCats />} path="/your-cats" /> {/* Route for YourCats */}
          <Route element={<h1>Not found!</h1>} path="*" />
        </Routes>
     
      </BrowserRouter>
    </div>
  );
};

export default injectContext(Layout);
