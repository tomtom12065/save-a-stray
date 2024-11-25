import React, { useEffect, useState, useContext } from "react";
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
  
      actions.getBreeds();
    
  }, [actions, store.breeds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!catName || !breed || !age) {
      setError("Please fill in all fields.");
      return;
    }

    const catData = {
      name: catName,
      breed: breed,
      age: age,
      description: description,
    };

    try {
      const response = await actions.uploadCat(catData);
      if (response.status === 201) {
        setSuccess("Cat uploaded successfully!");
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
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <label>Cat Name:</label>
        <input
          type="text"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          placeholder="Enter cat's name"
          required
        />

        <label>Breed:</label>
        <select
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          required
        >
          <option value="">Select a breed</option>
          {store.breeds &&
            store.breeds.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
        </select>

        <label>Age:</label>
        <select
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
