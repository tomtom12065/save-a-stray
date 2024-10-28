// CatTemplate.js

import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/catPage.css";

const CatTemplate = () => {
  const { id } = useParams();
  const { store } = useContext(Context);
  const cat = store.cats.find((cat) => cat.id === parseInt(id));

  const [addedToCart, setAddedToCart] = useState(false);

  if (!cat) {
    return <p>Cat not found.</p>;
  }

  const handleAddToCart = () => {
    setAddedToCart(true);
    // Show feedback to the user
  };

  return (
    <div className="cat-page-container">
      <h1 className="cat-name">{cat.name}</h1>

      <div className="cat-images-grid">
      
      </div>

      <p className="cat-description">
        Breed: {cat.breed} <br />
        Age: {cat.age} <br />
        Price: ${cat.price}
      </p>

      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={addedToCart}
      >
        {addedToCart ? "Added to Cart" : "Add to Cart"}
      </button>
    </div>
  );
};

export default CatTemplate;
