import React, { useState } from "react";
import "../../styles/catPage.css";

const CatTemplate = ({ catName, catDescription, catImages }) => {
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    // Consider showing feedback visually instead of an alert
    // e.g., show a notification or a message on the page
  };

  return (
    <div className="cat-page-container">
      <h1 className="cat-name">{catName}</h1>

      <div className="cat-images-grid">
        {catImages.map((image, index) => (
          <img 
            key={index} 
            src={image} 
            alt={`${catName} ${index + 1}`} 
            className="cat-image" 
          />
        ))}
      </div>

      <p className="cat-description">{catDescription}</p>

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
