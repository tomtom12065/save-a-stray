import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/profilePage.css";
import CatCard from "../component/catCard";
import Chatbox from "../component/chatbox";

const ProfilePage = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const [username, setUsername] = useState(store.user?.username || "");
  const [email, setEmail] = useState(store.user?.email || "");
  const [updateMessage, setUpdateMessage] = useState("");

  // State for toggling input fields
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

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

        setUsername(userProfile.username);
        setEmail(userProfile.email);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    actions.getSelfCats();
  }, [actions]);

  // Handle profile updates
 
 
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

 
 
 
  const handleUpdateProfile = async (type) => {
    const updatedInfo = type === "username" ? { username } : { email };
    const success = await actions.updateUser(updatedInfo);

    if (success) {
      setUpdateMessage(`${type === "username" ? "Username" : "Email"} updated successfully!`);
      if (type === "username") setShowUsernameInput(false);
      if (type === "email") setShowEmailInput(false);
    } else {
      setUpdateMessage(`Failed to update ${type}. Please try again.`);
    }
  };

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

        {/* Username Display and Update */}
        <div className="profile-info">
          <p className="profile-item">Username: {store.user.username}</p>
          <button
            className="toggle-button"
            onClick={() => setShowUsernameInput((prev) => !prev)}
          >
            {showUsernameInput ? "Cancel" : "Update Username"}
          </button>
          {showUsernameInput && (
            <div className="dropdown-input">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="profile-input"
              />
              <button
                className="save-button"
                onClick={() => handleUpdateProfile("username")}
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Email Display and Update */}
        <div className="profile-info">
          <p className="profile-item">Email: {store.user.email}</p>
          <button
            className="toggle-button"
            onClick={() => setShowEmailInput((prev) => !prev)}
          >
            {showEmailInput ? "Cancel" : "Update Email"}
          </button>
          {showEmailInput && (
            <div className="dropdown-input">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="profile-input"
              />
              <button
                className="save-button"
                onClick={() => handleUpdateProfile("email")}
              >
                Save
              </button>
            </div>
          )}
        </div>

        {updateMessage && <p className="update-message">{updateMessage}</p>}
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
                <CatCard cat={cat} />
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-no-cats">You have no cats.</p>
        )}
      </div>

      {/* Navigate to Inbox Button */}
      <div className="profile-inbox-button">
        <button onClick={() => navigate("/inbox")} className="inbox-button">
          Go to Inbox
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
