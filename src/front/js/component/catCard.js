// CatCard.js
import React from "react";
import { useNavigate } from "react-router-dom";

const CatCard = ({ cat, onDelete }) => {
  const navigate = useNavigate();

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
          onClick={() => onDelete(cat.id)}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
  
  );
};

export default CatCard;
