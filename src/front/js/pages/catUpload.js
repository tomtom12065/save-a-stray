// (1) Importing necessary React hooks, our global Context, and styling
import React, { useState, useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/catUpload.css";
import { useNavigate } from "react-router-dom";
// only display if user is logged in with the bar
// also put in user verification to enter the page
// (2) This component handles uploading a new cat's data, including images.

//     align-items: center;
// width: 60%;
// height: 100%;
// background-color: #f9f9f9;
// margin-top: 60px;
// border-radius: 10px;
// padding-top:20px;
//padding-bottom:20px;
// possibly put in ads onto this page









const CatUpload = () => {
  // (2a) Destructuring to gain access to store and actions from our global context
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();







  // (3) Local state to hold cat details
  const [catName, setCatName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState([]);           // Array of image files
  const [previewImages, setPreviewImages] = useState([]); // Array of image URLs for preview
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // (4) Fetch breed data from the store if not already loaded
  useEffect(() => {
    if (store.breeds.length === 0) {
      actions.getBreeds();
    }
  }, [store.breeds, actions]);

  // (5) Submit handler for the cat upload form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // (5a) Basic validations to ensure all required fields have a value
    if (!catName || !breed || !age || !price || !image.length) {
      setError("All fields are required.");
      return;
    }
    setError("");

    // (5b) Construct a FormData object to send to the server
    const formData = new FormData();
    formData.append("name", catName);
    formData.append("breed", breed);
    formData.append("age", age);
    formData.append("price", price);
    formData.append("description", description);

    for (let i = 0; i < image.length; i++) {
      formData.append("image", image[i]);
    }

    // (5c) Call the action to upload the cat data
    const result = await actions.postCatData2(formData);

    // (5d) Handle the response accordingly
    if (result && result.success) {
      alert("Cat uploaded successfully!");
      // Reset local state and navigate to home
      setCatName("");
      setBreed("");
      setAge("");
      setPrice("");
      setImage([]);
      setDescription("");
      setPreviewImages([]);
      navigate("/");
    } else {
      setError(result.message || "Failed to upload cat. Please try again.");
    }
  };

  // (6) Render the upload form, along with previews of any selected images
  return (
    // <div className="cat-upload-container">
    <div className="container cat-upload-div mt-4">
      <div className="text-center mb-4">
        <h2>Upload Cat</h2>
      </div>
      <div className="d-flex justify-content-center">
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
          <h5>we recommend a minimum rehome fee of $100 to discourage bad actors from applying for these pets</h5>
          <label htmlFor="price">rehome fee (USD):</label>
          <input
            id="price"
            type="number"
            value={price}
            min="100"
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            required
          />

          <label htmlFor="description">description:</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            required
          />

          <label htmlFor="upload-image">Upload Image(s):</label>
          <input
            id="upload-image"
            type="file"
            multiple
            onChange={(e) => {
              // (6a) Convert FileList to an array so we can append them to state
              const newFiles = Array.from(e.target.files);
              setImage((prevFiles) => [...prevFiles, ...newFiles]);

              // (6b) Generate preview URLs
              const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
              setPreviewImages((prevPreviews) => [...prevPreviews, ...newPreviews]);
            }}
            required
          />

          <div className="image-preview">
            {previewImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Preview ${index}`}
                style={{ width: "100px", marginRight: "10px" }}
              />
            ))}
          </div>

          <button type="submit">Upload Cat</button>
        </form>
      </div>
    </div>
  );
};

export default CatUpload;
