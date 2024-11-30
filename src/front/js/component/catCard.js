// CatCard.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../store/appContext";

const CatCard = ({ cat}) => {
  const navigate = useNavigate();
  const {  actions } = useContext(Context);

  const handleDeleteCat = async (catId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this cat?");
    if (confirmDelete) {
      const response = await actions.deleteCat(catId);
      if (response.success) {
        alert("Cat deleted successfully.");
        alert("Cat deleted successfully.");
        await actions.getSelfCats();
      } else {
        alert(`Failed to delete cat: ${response.message}`);
      }
    }
  };














  return (
    <div className="col-12 col-md-10 col-lg-10 mb-4">
    <div className="card w-100 short-card">
      <img
        src={cat.image_url || "https://via.placeholder.com/150"}
        alt={cat.name}
        className="card-img-top"
      />
      <div className="card-body">
        <h5 className="card-title">{cat.name}</h5>
        <p className="card-text">
          <strong>Breed:</strong> {cat.breed} <br />
          <strong>Age:</strong> {cat.age} years <br />
          <strong>Price:</strong> ${cat.price.toFixed(2)}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/cat-template/${cat.id}`)}
        >
          View Details
        </button>
        <button
          className="btn btn-danger mt-2"
          onClick={() => handleDeleteCat(cat.id)}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
  
  );
};

export default CatCard;
