import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/saveAStray.css";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="title">Save a Stray</h1>
      <div className="cat-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="cat-section">
            <div className="cat-image"></div>
            <p className="cat-description">Cat {index + 1}</p>
            <button
              className="learn-more-btn"
              onClick={() => navigate(`/catTemplate/${index + 1}`)}  
            >
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
