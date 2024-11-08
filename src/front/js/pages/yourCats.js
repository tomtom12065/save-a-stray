import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const YourCats = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (!store.cats || store.cats.length === 0) {
      // Load cats if they are not already in the store
      actions.getCats();
    }
  }, [store.cats, actions]);

  // Check if the user is logged in
  if (!store.user || !store.user.id) {
    return <p>Please log in to view your cats.</p>;
  }

  // Filter cats owned by the current user
  const userCats = store.cats.filter(cat => cat.owner_id === store.user.id);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Your Cats</h2>

      {userCats.length > 0 ? (
        <div className="row">
          {userCats.map(cat => (
            <div key={cat.id} className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{cat.name}</h5>
                  <p className="card-text">
                    <strong>Breed:</strong> {cat.breed} <br />
                    <strong>Age:</strong> {cat.age} years <br />
                    <strong>Price:</strong> ${cat.price.toFixed(2)}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/cat-template/${cat.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">You don't own any cats yet.</p>
      )}
    </div>
  );
};

export default YourCats;
