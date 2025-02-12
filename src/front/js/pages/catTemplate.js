// (1) Importing needed dependencies and contextual data
import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/catTemplate.css";
import { array } from "prop-types";

// (2) This component displays detailed information about a single cat (including images and info).
const CatTemplate = () => {
  // (2a) Extracting 'id' from URL parameters
  const { id } = useParams();
  // (2b) Destructuring our global Context for store and actions
  const { store, actions } = useContext(Context);
  // (2c) Local state for loading
  const [loading, setLoading] = useState(true);
  // (2d) For navigation to other routes
  const navigate = useNavigate();

  // (3) useEffect to fetch cat data when the component mounts or id changes
  useEffect(() => {
    const fetchCat = async () => {
      await actions.getCatById(id);
      setLoading(false);
    };
    fetchCat();
  }, [id, actions]);

  // (4) Show a loading message until the cat data is fetched
  if (loading) {
    return <p>Loading...</p>;
  }

  // (5) Retrieve the single cat data from our global store
  const cat = store.singleCat;

  // (6) If no cat is found in store, show a fallback message
  if (!cat) {
    return <p>Cat not found.</p>;
  }

  // (7) Handler to set chat recipient and open chatbox to message the cat's owner
  const handleMessageOwner = () => {
    console.log("message owner button clicked");
    actions.setChatRecipient(cat.user_id, cat.owner.username || "Owner");
    actions.toggleChatboxOpen(true);
  };

  // (8) Handling image URLs (some might be stored as JSON array or single string)
  let imagesArray;
  try {
    // Attempt to parse image URLs if it's a JSON string
    imagesArray = JSON.parse(cat.image_urls);
  } catch (error) {
    // If parse fails, treat the field as a single URL
    imagesArray = [cat.image_urls];
  }
  // (8a) Ensure the result is an array, if not, wrap in an array
  if (!Array.isArray(imagesArray)) {
    imagesArray = [imagesArray];
  }

  // (9) Rendering the cat details within a carousel if multiple images exist
  // need to add conditional buttons  that allow for the cat cards to be modified
  return (
    <div className="d-flex justify-content-center">
      <div className="cat-template">
        <h1 className="mx-auto text-center">{cat.name}</h1>

        {/* (9a) Carousel for cat images */}
        <div
          id={`carouselExampleFade-${cat.id}`}
          className="carousel slide carousel-fade"
          data-bs-ride="carousel"
          data-bs-interval="false"
        >
          <div className="carousel-inner">
            {imagesArray.map((imageUrl, idx) => (
              <div
                className={`carousel-item ${idx === 0 ? "active" : ""}`}
                key={idx}
              >
                <img
                  src={imageUrl || "https://via.placeholder.com/150"}
                  className="d-block mx-auto"
                  style={{ width: "400px", height: "400px" }}
                  alt={cat.name}
                />
              </div>
            ))}
          </div>

          {/* (9b) Show carousel controls only if multiple images */}
          {imagesArray.length > 1 && (
            <>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target={`#carouselExampleFade-${cat.id}`}
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target={`#carouselExampleFade-${cat.id}`}
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Next</span>
              </button>
            </>
          )}
        </div>

        {/* (10) Cat information and actions */}
        <div className="text-center">
          <p>
            <strong>Breed:</strong> {cat.breed}
          </p>
          <p>
            <strong>Age:</strong> {cat.age} years
          </p>
          <p>
            <strong>Price:</strong> ${cat.price.toFixed(2)}
          </p>
          <p>
            <strong>Description:</strong>
          </p>
          <p>
            <strong>{cat.description}</strong>
          </p>

          {/* (10a) Buttons to message owner or apply for adoption */}
          <button className="m-1" onClick={handleMessageOwner}>
            Message Owner
          </button>
          <button
            className="m-1"
            id="applyButton"
            onClick={() => navigate(`/application?catId=${cat.id}`)}
          >
            Apply for Adoption
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatTemplate;
