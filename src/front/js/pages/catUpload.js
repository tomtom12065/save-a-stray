import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../../styles/catPage.css";

const CatUpload = () => {
  const { actions, store } = useContext(Context);
  const navigate = useNavigate(); // Initialize navigate hook
  const [catName, setCatName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Fetch cat breeds on component mount
  useEffect(() => {
    if (!store.breeds || store.breeds.length === 0) {
      actions.getBreeds(); // Use existing getBreeds action
    }
  }, [actions, store.breeds]);

  // Handle Image Upload
  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      setError("Please select an image file.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedImageUrl = await actions.uploadImage(file);
      setIsUploading(false);

      if (uploadedImageUrl) {
        setImageUrl(uploadedImageUrl);
      } else {
        setError("Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setIsUploading(false);
      setError("An unexpected error occurred during image upload.");
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!catName || !breed || !age || !price || !imageUrl) {
      setError("Please fill in all required fields.");
      return;
    }

    const catData = {
      name: catName,
      breed: breed,
      age: age,
      price: parseFloat(price), // Convert price to a number
      image_url: imageUrl,
    };

    try {
      const response = await actions.postCatData2(catData);
      if (response && response.success) {
        navigate("/"); // Navigate home immediately after successful upload
      } else {
        setError(response.error || "Failed to upload the cat. Please try again.");
      }
    } catch (err) {
      console.error("Error uploading cat:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="cat-upload-container">
      <h2>Upload Cat</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <label htmlFor="cat-name">Cat Name:</label>
        <input
          id="cat-name"
          type="text"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          placeholder="Enter the cat's name"
          required
        />

        <label htmlFor="cat-breed">Breed:</label>
        <select
          id="cat-breed"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          required
        >
          <option value="">Select a breed</option>
          {store.breeds &&
            store.breeds.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
        </select>

        <label htmlFor="cat-age">Age (years):</label>
        <input
          id="cat-age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Enter age (1-20+)"
          min="1"
          max="20"
          required
        />

        <label htmlFor="cat-price">Price (USD):</label>
        <input
          id="cat-price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter price"
          step="0.01"
          required
        />

        <label>Upload Image:</label>
        <input type="file" onChange={handleImageChange} accept="image/*" />
        {isUploading && <p>Uploading image...</p>}

        <button type="submit" disabled={isUploading}>
          Upload Cat
        </button>
      </form>
    </div>
  );
};

export default CatUpload;
