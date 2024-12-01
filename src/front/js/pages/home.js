// Home.js
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/saveAStray.css";
import CatCard from "../component/catCard";  // Import the CatCard component

export const Home = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    actions.getCats();
  }, []);

  // const toggleSidebar = () => {
  //   setIsSidebarOpen(!isSidebarOpen);
  // };

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
      {/* <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        ☰ Menu
      </button>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> */}

      <h1 className="title">Save a Stray</h1>

      <div className="row cat-grid  ">
        {store.cats.length > 0 ? (
          store.cats.map((cat) => (
            <CatCard key={cat.id} cat={cat} onDelete={handleDeleteCat} />
          ))
        ) : (
          <p>No cats available.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
