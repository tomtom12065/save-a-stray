
// double check why profile pic isnt showing up


import React, { useContext, useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/profilePage.css"; 
import CatCard from "../component/catCard"; 
import Chatbox from "../component/chatbox"; 

const ProfilePage = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(store.user?.username || "");
  const [email, setEmail] = useState(store.user?.email || "");
  const [updateMessage, setUpdateMessage] = useState("");
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [profilePicError, setProfilePicError] = useState("");
  const [profilepic,setProfilePic] = useState("");
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userProfile = await actions.getUserProfile();
        if (!userProfile) {
          setError("Failed to fetch user profile.");
          return;
        }
        const success = await actions.getSelfCats();
        if (!success) setError("Failed to fetch your cats.");
        
        setUsername(userProfile.username);
        setEmail(userProfile.email);
        setProfilePic(userProfile.profilepic)
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [actions]);

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setProfilePicError("Please upload an image file");
      return;
    }

    try {
      setUploadingProfilePic(true);
      setProfilePicError("");
      const result = await actions.uploadProfilePic(file);
      
      if (result.success) {
        // Refresh user data to get updated profile picture
        await actions.getUserProfile();
      } else {
        setProfilePicError(result.message || "Failed to upload profile picture");
      }
    } catch (err) {
      console.error("Profile pic upload error:", err);
      setProfilePicError("An error occurred during upload");
    } finally {
      setUploadingProfilePic(false);
      e.target.value = ""; // Reset file input
    }
  };

  const handleUpdateProfile = async (type) => {
    setError(null);
    setUpdateMessage("");
    const updatedInfo = {
      username: type === "username" ? username : store.user.username,
      email: type === "email" ? email : store.user.email,
    };

    try {
      const response = await actions.updateUser(updatedInfo);
      if (response) {
        setUpdateMessage(`${type === "username" ? "Username" : "Email"} updated successfully!`);
        if (type === "username") setShowUsernameInput(false);
        if (type === "email") setShowEmailInput(false);
        await actions.getUserProfile();
      } else {
        setUpdateMessage(`Failed to update ${type}. Please try again.`);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred while updating your profile. Please try again.");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!store.user) {
    navigate("/login");
    return null;
  }
  const profilepicture = store.user.profilepic.slice(1,-1);

  return (
    <div className="profile-page">
      {/* Profile Picture Section */}
      <div className="profile-picture-section">
        <div className="profile-pic-container">
          <h1>{store.user.username}</h1>
          <img 
            src={profilepicture|| "https://via.placeholder.com/150"}
            alt="Profile" 
            className="profile-picture"
          />
          <div className="profile-pic-upload">
            <label htmlFor="profilePicInput" className="upload-label">
              {uploadingProfilePic ? "Uploading..." : "Change Photo"}
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePicUpload}
                disabled={uploadingProfilePic}
                style={{ display: 'none' }}
              />
            </label>
            {profilePicError && <div className="error-message">{profilePicError}</div>}
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="profile-section">
        <h1 className="profile-title">{store.user.username}'s Profile</h1>

        {/* Username Section */}
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

        {/* Email Section */}
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

      {/* Cats Section */}
      <div className="profile-cats">
        <h2 className="profile-cats-title">Your Cats</h2>
        {store.selfcats && store.selfcats.length > 0 ? (
          <div className="cats-horizontal-grid d-flex justify-content-center">
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

      {/* Inbox Button */}
      <div className="profile-inbox-button">
        <button onClick={() => navigate("/inbox")} className="inbox-button">
          Go to Inbox
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;