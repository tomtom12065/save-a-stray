import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import CatCard from "../component/catCard"; // Assuming the CatCard component exists

const YourCats = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  // Fetch the cats when the component mounts
  useEffect(() => {
    actions.getSelfCats(); // Get the user's cats using the Flux action
  }, [actions]);

  // Check if the user is logged in
  if (!store.user || !store.user.id) {
    return <p>Please log in to view your cats.</p>;
  }

  // Filter cats owned by the current user
  const userCats = store.selfcats;

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Your Cats</h2>

      {/* Display the cats in a grid layout */}
      <div className="row cat-grid">
        {userCats.length > 0 ? (
          userCats.map((cat) => (
            <CatCard key={cat.id} cat={cat} onDelete={() => handleDeleteCat(cat.id)} />
          ))
        ) : (
          <p className="text-center">You don't own any cats yet.</p>
        )}
      </div>
    </div>
  );
};

export default YourCats;
