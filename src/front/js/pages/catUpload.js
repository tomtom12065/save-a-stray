import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import "../../styles/catPage.css";

export default function CatUpload() {
  const { actions } = useContext(Context);
  const navigate = useNavigate();
  const [cat, setCat] = useState({ name: '', breed: '', age: '', price: '' });
  // potential to use session storage however fear for timeouts plan accordingly
  const token = localStorage.getItem("token");
  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const catData = {
        age: Number(cat.age),
        price: Number(cat.price),
        breed: cat.breed,
        name: cat.name,

      };

      // Retrieve token from localStorage
     
      // console.log(token)
      // if (!token) {
      //   alert("User is not authenticated. Please log in.");
      //   return;
      // }

      console.log("Submitting cat data:", catData);
      console.log("Token used for posting cat data:", token);

      // Pass catData and token to the action
      const response = await actions.postCatData(catData);

      console.log("Response from postCatData:", response);

      if (response.status === 200) {
        navigate("/");
      } else {
        alert(`Failed to add cat: ${response.error || "Please try again."}`);
      }
    }
    catch (error) {
      console.error("Error submitting cat data", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="upload-container">
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
        <button type="submit">Upload Cat</button>
      </form>
    </div>
  );
}
