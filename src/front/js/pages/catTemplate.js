import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/catTemplate.css";
import { useNavigate } from "react-router-dom";
import { array } from "prop-types";

const CatTemplate = () => {
  const { id } = useParams(); // Get the cat ID from the URL
  const { store, actions } = useContext(Context);
  const [loading, setLoading] = useState(true); // Handle loading state
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCat = async () => {
      await actions.getCatById(id); // Fetch the single cat and store it in the global state
      setLoading(false); // Mark as loaded
    };
    fetchCat();
  }, [id, actions]);

  // Display a loading message while fetching cat data
  if (loading) {
    return <p>Loading...</p>;
  }

  // Get the single cat details from the store
  const cat = store.singleCat;

  // Handle the case where no cat data is found
  if (!cat) {
    return <p>Cat not found.</p>;
  }

  // Use setChatRecipient action to set the chat context
  const handleMessageOwner = () => {
    console.log("message owner button clicked")
    actions.setChatRecipient(cat.user_id, cat.owner.username || "Owner"); // Set recipient info
    actions.toggleChatboxOpen(true); // Open the chatbox
  };

  // const getImageUrl =(imageUrls)=>{
  //   if (typeof imageUrls === "string") {
  //     return imageUrls;

  //   }
  //   if( Array.isArray(imageUrls) && imageUrls.length> 0) {
  //     return imageUrls[0];
  //   }
  // }

  // const getImageUrl = (imageUrls) => {
  //   try {
  //     // If it's a stringified array
  //     if (typeof imageUrls === 'string') {
  //       // Remove the square brackets and quotes
  //       const cleanUrl = imageUrls.replace(/[\[\]"]/g, '');
  //       return cleanUrl || '/api/placeholder/400/300';
  //     }

  //     // If it's already an array
  //     if (Array.isArray(imageUrls) && imageUrls.length > 0) {
  //       return imageUrls[0];
  //     }

  //     // Fallback to placeholder
  //   //  replace with real placeholder
  //     return '/api/placeholder/400/300';
  //   } catch (error) {
  //     console.error('Error parsing image URL:', error);
  //     return '/api/placeholder/400/300';
  //   }
  // };

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
    <div className="d-flex justify-content-center">
      <div className="cat-template">
        <h1 className="mx-auto">{cat.name}</h1>
        {/* why is image not working  */}
        {/* <img src={cat.image_urls} alt={cat.name} /> */}


        <div
          id={`carouselExampleFade-${cat.id}`}
          className="carousel slide carousel-fade"
          data-bs-ride="carousel"
          data-bs-interval="false"
        >




          <div className="
          
          carousel-inner  ">
            {imagesArray.map((imageUrl, idx) => (
              <div
                className={`carousel-item   ${idx === 0 ? "active" : ""}`}
                key={idx}
              >
                <img
                  src={imageUrl || "https://via.placeholder.com/150"}
                  className="d-block mx-auto "
                  style = {{width:"400px",height:"400px"}}
                  alt={cat.name}
               
  
                />
              </div>
            ))}
          </div>
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
        <p><strong>{cat.description}</strong></p>
        <button onClick={handleMessageOwner}>Message Owner</button>
        <button id="applyButton" onClick={() => navigate(`/application?catId=${cat.id}`)}>
          Apply for Adoption
        </button>
      </div>
    </div>
  );
};

export default CatTemplate;
