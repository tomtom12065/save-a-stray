import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/profilePage.css";
import CatCard from "../component/catCard"; // Import the CatCard component
import Chatbox from "../component/chatbox";

const ProfilePage = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Fetch user profile
        const userProfile = await actions.getUserProfile();
        if (!userProfile) {
          setError("Failed to fetch user profile.");
          return;
        }

        // Fetch user's cats
        const success = await actions.getSelfCats();
        if (!success) {
          setError("Failed to fetch your cats.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [actions]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!store.user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="profile-page">
      {/* User Profile Section */}
      <div className="profile-section">
        <h1 className="profile-title">{store.user.username}'s Profile</h1>
        <p className="profile-email">Email: {store.user.email}</p>
      </div>

      {/* Chatbox Section */}
      <div className="profile-chatbox">
        <Chatbox />
      </div>

      {/* User's Cats Section */}
      <div className="profile-cats">
        <h2 className="profile-cats-title">Your Cats</h2>
        {store.selfcats && store.selfcats.length > 0 ? (
          <div className="cats-horizontal-grid">
            {store.selfcats.map((cat) => (
              <div key={cat.id} className="cat-card-wrapper">
                <CatCard cat={cat} /> {/* Wrap each CatCard for consistent sizing */}
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-no-cats">You have no cats.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
