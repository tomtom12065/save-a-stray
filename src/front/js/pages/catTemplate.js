import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/catTemplate.css";
import { useNavigate } from "react-router-dom";

const CatTemplate = () => {
  const { id } = useParams(); // Get the cat ID from the URL
  const { store, actions } = useContext(Context);
  const [loading, setLoading] = useState(true); // Handle loading state
  const navigate = useNavigate();
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

  // Use setChatRecipient action to set the chat context
  const handleMessageOwner = () => {
    console.log("message owner button clicked")
    actions.setChatRecipient(cat.user_id, cat.owner.username || "Owner"); // Set recipient info
    actions.toggleChatboxOpen(true); // Open the chatbox
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
      <button id="applyButton"onClick={() => navigate(`/application?catId=${cat.id}`)}>
    Apply for Adoption
</button>
    </div>
  );
};

export default CatTemplate;
