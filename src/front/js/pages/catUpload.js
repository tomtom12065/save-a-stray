import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import "../../styles/catPage.css";

const CatUpload = () => {
  const { actions, store } = useContext(Context);
  const [catName, setCatName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch cat breeds on component mount
  useEffect(() => {
    if (!store.breeds || store.breeds.length === 0) {
      actions.getBreeds(); // Use existing getBreeds action
    }
  }, [actions, store.breeds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!catName || !breed || !age) {
      setError("Please fill in all required fields.");
      return;
    }

    const catData = {
      name: catName,
      breed: breed,
      age: age,
      description: description,
    };

    try {
      const response = await actions.uploadCat(catData); // Existing uploadCat action
      if (response.status === 201) {
        setSuccess("Cat uploaded successfully!");
        // Clear form fields after success
        setCatName("");
        setBreed("");
        setAge("");
        setDescription("");
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
        {success && <p className="success-message">{success}</p>}

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

        <label htmlFor="cat-age">Age:</label>
        <select
          id="cat-age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        >
          <option value="">Select age</option>
          <option value="<1 year">&lt;1 year</option>
          <option value="1 year">1 year</option>
          <option value="2 years">2 years</option>
          <option value="3 years">3 years</option>
          <option value="4 years">4 years</option>
          <option value="5 years">5 years</option>
        </select>


        <button type="submit">Upload Cat</button>
      </form>
    </div>
  );
};

export default CatUpload;
