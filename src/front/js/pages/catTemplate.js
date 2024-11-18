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

  // Cloudinary URL with transformation for resizing
  const cloudinaryUrl = cat.image_url
  console.log(cat.image_url)
    ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_300,h_200,c_fill/${cat.image_url}`
    : "https://via.placeholder.com/300x200"; // Fallback if no image

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
