import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { Context } from "../store/appContext";
import "../../styles/catTemplate.css";

const CatTemplate = () => {
  const { id } = useParams(); // Get the cat ID from the URL
  const { store, actions } = useContext(Context);
  const [loading, setLoading] = useState(true); // Handle loading state
  const navigate = useNavigate(); // For navigation

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

  // Function to handle creating a conversation and redirecting to Inbox
  const handleChatClick = async () => {
    try {
      // Call backend to create conversation
      await actions.createConversation(cat.user_id);

      // Navigate to Inbox with owner info
      navigate("/inbox", {
        state: { ownerId: cat.user_id, ownerName: cat.owner?.username || "Owner" },
      });
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
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
      <button onClick={handleChatClick}>Message Owner</button>
    </div>
  );
};

export default CatTemplate;
