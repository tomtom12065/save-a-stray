// CatCard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/catCard.css";
const CatCard = ({ cat }) => {
  const navigate = useNavigate();
  const { actions } = useContext(Context);

  const handleDeleteCat = async (catId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this cat?");
    if (confirmDelete) {
      const response = await actions.deleteCat(catId);
      if (response.success) {
        alert("Cat deleted successfully.");
        await actions.getSelfCats();
      } else {
        alert(`Failed to delete cat: ${response.message}`);
      }
    }
  };

  // Safely parse image URLs (if stored as JSON array)
  let imagesArray;
  try {
    imagesArray = JSON.parse(cat.image_urls);
  } catch (error) {
    // If it's not valid JSON, treat the field as a single URL
    imagesArray = [cat.image_urls];
  }
  // Ensure imagesArray is indeed an array
  if (!Array.isArray(imagesArray)) {
    imagesArray = [imagesArray];
  }

  return (
    <div className="col-12 col-md-10 col-lg-10 mb-4">
      <div className="card w-100 short-card">

        {/* Bootstrap carousel */}
        <div
          id={`carouselExampleFade-${cat.id}`}
          className="carousel slide carousel-fade"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            {imagesArray.map((imageUrl, idx) => (
              <div
                className={`carousel-item ${idx === 0 ? "active" : ""}`}
                key={idx}
              >
                <img
                  src={imageUrl || "https://via.placeholder.com/150"}
                  className="d-block w-100"
                  alt={cat.name}
                />
              </div>
            ))}
          </div>

          {/* Show Prev/Next only if there's more than one image */}
          {imagesArray.length > 1 && (
            <>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target={`#carouselExampleFade-${cat.id}`}
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target={`#carouselExampleFade-${cat.id}`}
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </>
          )}
        </div>
        {/* End Bootstrap carousel */}

        <div className="card-body">
          <h5 className="card-title">{cat.name}</h5>
          <p className="card-text">
            <strong>Breed:</strong> {cat.breed} <br />
            <strong>Age:</strong> {cat.age} years <br />
            <strong>Price:</strong> ${cat.price.toFixed(2)}
          </p>
          <div className="d-flex align-items-center justify-content-center">
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/cat-template/${cat.id}`)}
            >
              View Details
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleDeleteCat(cat.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatCard;
