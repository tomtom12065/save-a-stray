import React from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css"

;export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        {/* Logo/Brand Name */}
        <Link to="/" className="navbar-brand mb-0 h1">
          Save A Stray
        </Link>

        {/* Navbar Toggler for Mobile View */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Home Page */}
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>

            {/* Cat Listings */}
            <li className="nav-item">
              <Link to="/cat-upload" className="nav-link">
                catupload
              </Link>
            </li>

            {/* Login */}
            <li className="nav-item">
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </li>

            {/* Register */}
            <li className="nav-item">
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </li>

            {/* About Page */}
            <li className="nav-item">
              <Link to="/about" className="nav-link">
                About
              </Link>
            </li>

            {/* Contact Page */}
            <li className="nav-item">
              <Link to="/profile" className="nav-link"
			  >
                profile
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
