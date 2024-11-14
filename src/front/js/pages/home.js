// Home.js

import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/saveAStray.css";
import Sidebar from "../component/sidebar";
// import "../../styles/sidebar.css";

export const Home = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    actions.getCats();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handler to delete cat by ID
  const handleDeleteCat = async (catId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this cat?");
    if (confirmDelete) {
      const response = await actions.deleteCat(catId);
      if (response.success) {
        alert("Cat deleted successfully.");
        await actions.getCats();

      } else {
        alert(`Failed to delete cat: ${response.message}`);
      }
    }
  };
  const handleLogout = () => {
    actions.logout(); // Trigger logout action
    navigate("/login"); // Redirect to login page after logging out
  };

  return (
    <div className="home-container">
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        ☰ Menu
      </button>
    
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <h1 className="title">Save a Stray</h1>

      <div className="cat-grid">
        {store.cats.length > 0 ? (
          store.cats.map((cat) => (
            <div key={cat.id} className="cat-section">
              <div className="cat-image">
              <div className="cat-image">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="cat-thumbnail" />
                ) : (
                  <p>No image available</p>
                )}
              </div>
              </div>
              <p className="cat-description">{cat.name}</p>
              <button
                className="learn-more-btn"
                onClick={() => navigate(`/cat-template/${cat.id}`)}
              >
                Learn More
              </button>
              {/* make a conditional if user uploaded cat shows the delete button  */}
              <button
                className="delete-cat-btn"
                onClick={() => handleDeleteCat(cat.id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No cats available.</p>
        )}
      </div>

    
    </div>
  );
};

export default Home;
