import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { Context } from "../store/appContext";
import "../../styles/catTemplate.css";

const CatTemplate = () => {
  const { id } = useParams(); // Get the cat ID from the URL
  const navigate = useNavigate(); // For navigating to the chatbox
  const { store, actions } = useContext(Context);
  const [loading, setLoading] = useState(true); // For loading state

  // Fetch the cat data when the component mounts
  useEffect(() => {
    const fetchCat = async () => {
      await actions.getCatById(id); // Fetch the cat by ID
      setLoading(false);
    };

    fetchCat();
  }, [id, actions]);

  if (loading) {
    return <p>Loading...</p>; // Show loading message while the cat data is being fetched
  }

  const cat = store.singleCat;

  if (!cat) {
    return <p>Cat not found.</p>; // Handle case where the cat is not found
  }

  // Cloudinary URL for the image or a placeholder
  const cloudinaryUrl = cat.image_url
    ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_200,c_fill/${cat.image_url}`
    : "https://via.placeholder.com/300x200"; // Fallback if no image

  // Function to handle sending a message to the cat's owner
  const handleStartConversation = async () => {
    try {
      const senderId = store.user?.id; // Logged-in user's ID
      const recipientId = cat.owner?.id; // Cat owner's ID

      if (!senderId || !recipientId) {
        alert("Unable to start a conversation. User or owner information is missing.");
        return;
      }

      const messageText = `Hello! I'm interested in your cat named ${cat.name}.`; // Initial message

      // Call the sendMessage action
      const response = await actions.sendMessage(senderId, recipientId, messageText);

      if (response) {
        alert("Message sent to the cat owner!");
        navigate(`/chat/${recipientId}`); // Redirect to the Chatbox page
      } else {
        alert("Failed to send the message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="cat-page-container">
      <h1 className="cat-name">{cat.name}</h1>

      <div className="cat-images-grid">
        <img
          className="img-fluid w-50 p-3 w-sm-75 w-md-50 w-lg-25"
          src={cloudinaryUrl} // Use the dynamically generated Cloudinary URL
          alt={cat.name}
        />
      </div>

      <p className="cat-description">
        Breed: {cat.breed} <br />
        Age: {cat.age} <br />
        Price: ${cat.price}
      </p>

      {/* Button to send a message to the cat owner */}
      <button className="start-chat-btn" onClick={handleStartConversation}>
        Message Owner
      </button>
    </div>
  );
};

export default CatTemplate;
