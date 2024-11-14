import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import "../../styles/catPage.css";

export default function CatUpload() {
  const { actions } = useContext(Context);
  const navigate = useNavigate();
  const [cat, setCat] = useState({ name: '', breed: '', age: '', price: '', imageUrl: '' });
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  const token = sessionStorage.getItem("token");

  // Cloudinary Image Upload Function
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "cats"); // Uploads the image to the 'cats' folder

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        console.log("Uploaded image URL:", data.secure_url);
        return data.secure_url;
      } else {
        console.error("Upload error:", data.error.message);
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  // Handle Image Change
  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      setError("Please select an image file.");
      return;
    }

    setIsUploading(true);
    const imageUrl = await uploadImage(file);
    setIsUploading(false);

    if (imageUrl) {
      setCat({ ...cat, imageUrl });
    } else {
      setError("Failed to upload image. Please try again.");
    }
  };

  // Handle Form Submission
  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const catData = {
        age: Number(cat.age),
        price: Number(cat.price),
        breed: cat.breed,
        name: cat.name,
        imageUrl: cat.imageUrl,
      };

      console.log("Submitting cat data:", catData);

      const response = await actions.postCatData(catData);
      console.log("Response from postCatData:", response);

      if (response.success) {
        navigate("/");
      } else {
        setError(response.message || "Failed to add cat");
        alert(`Failed to add cat: ${response.message || "Please try again."}`);
      }
    } catch (error) {
      console.error("Error submitting cat data:", error);
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="upload-container">
      {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={onSubmit}>
        <label>Name:</label>
        <input
          type="text"
          value={cat.name}
          onChange={(e) => setCat({ ...cat, name: e.target.value })}
          required
        />
        <label>Age:</label>
        <input
          type="number"
          value={cat.age}
          onChange={(e) => setCat({ ...cat, age: e.target.value })}
          required
        />
        <label>Breed:</label>
        <input
          type="text"
          value={cat.breed}
          onChange={(e) => setCat({ ...cat, breed: e.target.value })}
          required
        />
        <label>Price:</label>
        <input
          type="number"
          value={cat.price}
          onChange={(e) => setCat({ ...cat, price: e.target.value })}
          required
        />
        <label>Upload Image:</label>
        <input
          type="file"
          onChange={handleImageChange}
          accept="image/*"
        />
        {isUploading && <p>Uploading image...</p>}
        <button type="submit" disabled={isUploading}>Upload Cat</button>
      </form>
    </div>
  );
}
