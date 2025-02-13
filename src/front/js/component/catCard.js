// CatCard.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/catCard.css";
// modal to update info on the profile page
// do a conditional on the catTemplate page  for an edit button
// potentially make an edit mode
const CatCard = ({ cat }) => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);

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

  const handleAddImages = async () => {
    // Create a hidden file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.onchange = async (event) => {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      // Call the flux action that handles image uploading and updating
      const response = await actions.appendCatImages(cat.id, files);
      if (response.success) {
        alert("Images updated successfully");
        // Optionally, refresh the cat data here
      } else {
        alert("Error updating images: " + response.message);
      }
    };
    fileInput.click(); // Open the file dialog
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
    <div className="col-12 col-md-4 col-lg-3 mb-4 cat-card-container">
      <div className="card h-100" style={{ maxWidth: "300px" }}>
        {/* Bootstrap carousel */}
        <div id={`carouselExampleFade-${cat.id}`} className="carousel slide carousel-fade" data-bs-ride="carousel">
          <div className="carousel-inner">
            {imagesArray.map((imageUrl, idx) => (
              <div className={`carousel-item ${idx === 0 ? "active" : ""}`} key={idx}>
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
          <div className="d-flex align-items-center justify-content-center ">
            <div className="d-flex align-items-center justify-content-center ">
              {store.user && store.user.id === cat.owner.id ? (
                <>
                  <button className="custom-btn me-2" onClick={() => navigate(`/cat-template/${cat.id}`)}>
                    Edit Mode
                  </button>
                  <button className="custom-btn" onClick={() => handleDeleteCat(cat.id)}>
                    Delete
                  </button>
                </>
              ) : (
                <button className="custom-btn" onClick={() => navigate(`/cat-template/${cat.id}`)}>
                  View Details
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CatCard;
