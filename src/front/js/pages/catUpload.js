import React, { useState, useContext, useEffect } from "react";

import { Context } from "../store/appContext";
import "../../styles/catUpload.css";
import { useNavigate } from "react-router-dom";
const CatUpload = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  
  const [catName, setCatName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState([]); // to store multiple or single file
  const [error, setError] = useState("");

  useEffect(() => {
    if (store.breeds.length === 0) {
      actions.getBreeds();
    }
  }, [store.breeds, actions]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!catName || !breed || !age || !price || !image.length) {
      setError("All fields are required.");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("name", catName);
    formData.append("breed", breed);
    formData.append("age", age);
    formData.append("price", price);

    // Append each file
    for (let i = 0; i < image.length; i++) {
      formData.append("image", image[i]);
    }

    const result = await actions.postCatData2(formData);

    if (result && result.success) {
      alert("Cat uploaded successfully!");
      setCatName("");
      setBreed("");
      setAge("");
      setPrice("");
      setImage([]);
      navigate("/");
    } else {
      setError("Failed to upload cat. Please try again.");
    }
  };

  return (
    <div className="cat-upload-container">
      <h2>Upload Cat</h2>
      <form className="cat-upload-form" onSubmit={handleSubmit}>
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

        <label htmlFor="breed">Breed:</label>
        <select
          id="breed"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          required
        >
          <option value="">Select a breed</option>
          {store.breeds.map((breedName) => (
            <option key={breedName} value={breedName}>
              {breedName}
            </option>
          ))}
        </select>

        <label htmlFor="age">Age (years):</label>
        <input
          id="age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Enter age"
          required
        />

        <label htmlFor="price">Price (USD):</label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter price"
          required
        />

        <label htmlFor="upload-image">Upload Image(s):</label>
        <input
          id="upload-image"
          type="file"
          multiple
          onChange={(e) => {
            setImage(e.target.files); 
          }}
          required
        />

        <button type="submit">Upload Cat</button>
      </form>
    </div>
  );
};

export default CatUpload;
