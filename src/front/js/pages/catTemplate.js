import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/catTemplate.css";

const CatTemplate = () => {
  const { id } = useParams(); // Get the cat ID from the URL
  const { store, actions } = useContext(Context);
  const [loading, setLoading] = useState(true); // Handle loading state
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchCat = async () => {
      await actions.getCatById(id); // Fetch the single cat and store it in the global state
      setLoading(false); // Mark as loaded
    };
    fetchCat();
  }, [id, actions]);

  // Display a loading message while fetching cat data
  if (loading) {
    return <p>Loading...</p>;
  }

  // Get the single cat details from the store
  const cat = store.singleCat;

  // Handle the case where no cat data is found
  if (!cat) {
    return <p>Cat not found.</p>;
  }

  // Function to handle redirection to the inbox
  const handleMessageOwner = () => {
    navigate("/inbox", { state: { recipientId: cat.user_id } }); // Navigate to Inbox with recipientId
  };

  return (
    <div className="cat-template">
      <h1>{cat.name}</h1>
      <img src={cat.image_url} alt={cat.name} />
      <p>
        <strong>Breed:</strong> {cat.breed}
      </p>
      <p>
        <strong>Age:</strong> {cat.age} years
      </p>
      <p>
        <strong>Price:</strong> ${cat.price.toFixed(2)}
      </p>
      <button onClick={handleMessageOwner}>Message Owner</button>
    </div>
  );
};

export default CatTemplate;
