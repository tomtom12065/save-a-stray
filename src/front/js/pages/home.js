// (1) Importing necessary modules and components from React and our application's Context
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/saveAStray.css";
import CatCard from "../component/catCard";  // Import the CatCard component




// in local site need to change the pipfile the yaml pip file
// delte pnpm.yaml and package-lock.json and do pnpm install 

// classmate collaborations?
// also helps practicing wit collaboration
// allows for biggr projects
// use more third party api's
// study stripe more
// go deeper into payments
//color matching with julie// add a search bar for breeds on home page
// 

// (2) Home component displays a list of available cats and allows deletion (if user has permissions).
export const Home = () => {
  // (2a) useNavigate from React Router for navigation
  const navigate = useNavigate();
  // (2b) Destructuring the global 'store' and 'actions'
  const { store, actions } = useContext(Context);

  // (3) On mount, fetch the list of cats by calling 'actions.getCats()'
  useEffect(() => {
    actions.getCats();
  }, [actions]);

  // (4) Handler to delete a cat using the cat's ID
  //     Called when a user clicks a delete button in CatCard
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

  // (5) Handler to log the user out and navigate to the login page
  const handleLogout = () => {
    actions.logout();
    navigate("/login");
  };

  // (6) Rendering the home page with a grid of CatCard components
  //     The 'onDelete' prop is passed to CatCard for cat deletion
  return (
    <div className="home-container">
      {/* <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        ☰ Menu
      </button>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> */}

      <h1 className="title">Save a Stray</h1>
      <h3>the price is set to minimum $100 to discourage dog fighters from adopting the pets</h3>
      <h3>site updates weekly</h3>
      <h3>if the site doesn't load give it a minute, its all running on free services,im broke</h3>
      {/* <div className="row cat-grid"> */}
     <div className="scroll-container">
      <div className="row g-4">
        {store.cats.length > 0 ? (
          store.cats.map((cat) => (
            <CatCard key={cat.id} cat={cat} onDelete={handleDeleteCat} />
          ))
        ) : (
          <p>cats loading please wait
            .</p>
        )}
      </div>
      </div>
    </div>
  );
};

export default Home;
