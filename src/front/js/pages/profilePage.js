// (1) Importing necessary libraries and components from React and React Router, and our own Context store.
import React, { useContext, useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/profilePage.css"; 
import CatCard from "../component/catCard"; 
import Chatbox from "../component/chatbox"; 

// (2) This is the main component function. It displays the user's profile, their cats, and a chatbox.
const ProfilePage = () => {
  // (3) Destructuring 'store' and 'actions' from our global Context.
  const { store, actions } = useContext(Context);
  
  // (4) Used for navigation between routes.
  const navigate = useNavigate();

  // (5) Local state for handling loading and error messages.
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 

  // (6) Local state for username, email, and an update message after saving changes.
  const [username, setUsername] = useState(store.user?.username || "");
  const [email, setEmail] = useState(store.user?.email || "");
  const [updateMessage, setUpdateMessage] = useState("");

  // (7) Local state for toggling the input fields for username and email updates.
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  // (8) useEffect calls fetchUserData on component mount to get user info and user's cats.
  useEffect(() => {
    // (8a) Async function to fetch user data from our actions in the Context.
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // (8b) Calls an action to retrieve the user profile.
        const userProfile = await actions.getUserProfile();
        if (!userProfile) {
          setError("Failed to fetch user profile.");
          return;
        }

        // (8c) Calls an action to fetch the user's cats.
        const success = await actions.getSelfCats();
        if (!success) {
          setError("Failed to fetch your cats.");
        }

        // (8d) Updates local state with fetched user data.
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
  }, [actions]);

  // (9) Function to handle profile updates (for username or email).
  //     It's referenced in the "Save" button clicks for username and email.
  const handleUpdateProfile = async (type) => {
    setError(null);
    setUpdateMessage("");

    // (9a) Prepare the updated data, only changing the field we're updating.
    const updatedInfo = {
      username: type === "username" ? username : store.user.username,
      email: type === "email" ? email : store.user.email,
    };

    try {
      // (9b) Calls an action to update the user's info.
      const response = await actions.updateUser(updatedInfo);

      if (response) {
        setUpdateMessage(
          `${type === "username" ? "Username" : "Email"} updated successfully!`
        );
        if (type === "username") setShowUsernameInput(false);
        if (type === "email") setShowEmailInput(false);

        // (9c) Refresh the user data in the store.
        await actions.getUserProfile();
      } else {
        setUpdateMessage(`Failed to update ${type}. Please try again.`);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred while updating your profile. Please try again.");
    }
  };

  // (10) Function to handle cat deletion. Referenced in code, but not currently tied to any UI element here.
  //      Possibly used within a CatCard or another component in the future.
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

  // (11) If data is still loading, we show a loading message.
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // (12) If there's an error, display it.
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // (13) If no user in store, redirect to login page.
  if (!store.user) {
    navigate("/login");
    return null;
  }

  // (14) Render the profile page.
  return (
    <div className="profile-page">
      {/* (14a) User Profile Section */}
      <div className="profile-section">
        <h1 className="profile-title">{store.user.username}'s Profile</h1>

        {/* (14b) Username Display and Update */}
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

        {/* (14c) Email Display and Update */}
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

        {/* (14d) Displays success or failure messages after updating profile */}
        {updateMessage && <p className="update-message">{updateMessage}</p>}
      </div>

      {/* (14e) Chatbox Section */}
      <div className="profile-chatbox">
        <Chatbox />
      </div>

      {/* (14f) User's Cats Section */}
      <div className="profile-cats">
        <h2 className="profile-cats-title">Your Cats</h2>
        {store.selfcats && store.selfcats.length > 0 ? (
          <div className="cats-horizontal-grid d-flex justify-content-center">
            {store.selfcats.map((cat) => (
              <div key={cat.id} className="cat-card-wrapper">
                {/* (14g) CatCard component to display individual cat details */}
                <CatCard cat={cat} />
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-no-cats">You have no cats.</p>
        )}
      </div>

      {/* (14h) Navigate to Inbox Button */}
      <div className="profile-inbox-button">
        <button onClick={() => navigate("/inbox")} className="inbox-button">
          Go to Inbox
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
