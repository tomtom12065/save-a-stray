// Home.js

import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/saveAStray.css";

export const Home = () => {
  const navigate = useNavigate();
  const { store,actions} = useContext(Context);
useEffect(()=>{
  actions.getCats()
},[])

  return (
    <div className="home-container">
      <h1 className="title">Save a Stray</h1>
      <div className="cat-grid">
        {store.cats.length > 0 ? (
          store.cats.map((cat) => (
            <div key={cat.id} className="cat-section">
              <div className="cat-image">
                {/* Display cat image if available */}
              </div>
              <p className="cat-description">{cat.name}</p>
              <button
                className="learn-more-btn"
                onClick={() => navigate(`/cat-template/${cat.id}`)}
              >
                Learn More
              </button>
            </div>
          ))
        ) : (
          <p>No cats available.</p>
        )}
      </div>
      <button
        className="upload-cat-btn"
        onClick={() => navigate("/cat-upload")}
      >
        Upload a Cat
      </button>
    </div>
  );
};

export default Home;
