import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/catTemplate.css";

const CatTemplate = () => {
  const { id } = useParams(); // Get the cat ID from the URL
  const { store, actions } = useContext(Context);
  const [loading, setLoading] = useState(true);

  // Fetch the cat data when the component mounts
  useEffect(() => {
    actions.getCatById(id); // Fetch the cat by ID
  }, [id, actions]);

  useEffect(() => {
    if (store.singleCat) {
      setLoading(false); // Set loading to false once the cat data is available
    }
  }, [store.singleCat]);

  if (loading) {
    return <p>Loading...</p>; // Show loading message while the cat data is being fetched
  }

  const cat = store.singleCat;

  if (!cat) {
    return <p>Cat not found.</p>; // Handle case where the cat is not found
  }

  // Use cat.image_url directly for consistency with other methods
  const imageUrl = cat.image_url || "https://via.placeholder.com/300x200"; // Fallback if no image

  return (
    <div className="cat-page-container">
      <h1 className="cat-name">{cat.name}</h1>

      <div className="cat-image-container">
        <img
          className="cat-image"
          src={imageUrl}
          alt={cat.name}
        />
      </div>

      <p className="cat-description">
        Breed: {cat.breed} <br />
        Age: {cat.age} <br />
        Price: ${cat.price}
      </p>

      <button
        className="add-to-cart-btn"
        onClick={() => alert("Added to cart!")}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default CatTemplate;
