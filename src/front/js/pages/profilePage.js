import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/profilePage.css";

const ProfilePage = ({ userId }) => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const profile = await actions.getUserProfile(userId);
      setUserProfile(profile);
      setIsLoading(false);
    };

    fetchUserProfile();
  }, [userId, actions]);

  if (isLoading) return <div>Loading...</div>;

  if (!userProfile) return <div>User not found.</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{userProfile.username}'s Profile</h2>
      </div>

      <div className="profile-details">
        <p>
          <strong>Email:</strong> {userProfile.email}
        </p>
        <p>
          <strong>Active:</strong> {userProfile.is_active ? "Yes" : "No"}
        </p>
        <p>
          <strong>Total Cats:</strong> {userProfile.cats.length}
        </p>
      </div>

      <div className="cat-grid">
        <h3>{userProfile.username}'s Cats</h3>
        {userProfile.cats.length > 0 ? (
          userProfile.cats.map((cat) => (
            <div key={cat.id} className="cat-card">
              <img src={cat.imageUrl} alt={cat.name} className="cat-image" />
              <div className="cat-details">
                <h5>{cat.name}</h5>
                <p>Breed: {cat.breed}</p>
                <p>Age: {cat.age}</p>
                <p>Price: ${cat.price}</p>
              </div>
            </div>
          ))
        ) : (
          <p>This user has no cats listed.</p>
        )}
      </div>

      <div className="profile-actions">
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/message/${userId}`)}
        >
          Message {userProfile.username}
        </button>
        {store.user && store.user.id === userId && (
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/edit-profile")}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
