import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../../styles/profilePage.css';
import ChatBox from '../component/chatbox';

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
          setError('Failed to fetch user profile.');
          return;
        }

        // Fetch user's cats
        const success = await actions.getSelfCats();
        if (!success) {
          setError("Failed to fetch your cats.");
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [actions, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className='error-message'>{error}</div>;
  }

  if (!store.user) {
    navigate('/login');
    return null;
  }

  return (
    <div className='profile-page'>
      {/* User Profile Section */}
      <div className='user-profile'>
        <h1>{store.user.username}'s Profile</h1>
        <p>Email: {store.user.email}</p>
        {/* Add more profile details as needed */}
      </div>

      {/* User's Cats Section */}
      <div className='user-cats'>
        <h2>Your Cats</h2>
        {store.selfcats && store.selfcats.length > 0 ? (
          <ul className='cats-list'>
            {store.selfcats.map((cat) => (
              <li key={cat.id} className='cat-item'>
                <h3>{cat.name}</h3>
                <p>Breed: {cat.breed}</p>
                <p>Age: {cat.age}</p>
                <p>Price: ${cat.price}</p>
                {cat.image_url && (
                  <img
                    src={cat.image_url}
                    alt={`${cat.name}`}
                    className='cat-image'
                  />
                )}
                {/* Add more cat details or actions (e.g., edit, delete) as needed */}
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no cats.</p>
        )}
        <ChatBox></ChatBox>
      </div>
    </div>
  );
};

export default ProfilePage;
