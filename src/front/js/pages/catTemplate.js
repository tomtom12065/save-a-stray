import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/catTemplate.css";

const CatTemplate = () => {
  const { id } = useParams();
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Inline editing states
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingBreed, setEditingBreed] = useState(false);
  const [newBreed, setNewBreed] = useState("");
  const [editingAge, setEditingAge] = useState(false);
  const [newAge, setNewAge] = useState("");
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  // State for selected files (for appending cat images)
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchCat = async () => {
      await actions.getCatById(id);
      if (isMounted) setLoading(false);
    };
    fetchCat();
    return () => {
      isMounted = false;
    };
  }, [id, actions]);

  useEffect(() => {
    if (store.singleCat) {
      setNewName(store.singleCat.name || "");
      setNewBreed(store.singleCat.breed || "");
      setNewAge(store.singleCat.age?.toString() || "");
      setNewPrice(store.singleCat.price?.toString() || "");
      setNewDescription(store.singleCat.description || "");
    }
  }, [store.singleCat]);

  if (loading) return <p>Loading...</p>;
  if (!store.singleCat) return <p>Cat not found.</p>;
  const cat = store.singleCat;
  const isOwner = store.user?.id === cat.owner?.id;

  const handleSaveField = async (field, value, setEditingFn) => {
    let parsedValue = value;
    try {
      if (field === "age") {
        parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) throw new Error("Invalid age");
      } else if (field === "price") {
        parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) throw new Error("Invalid price");
      }
    } catch (error) {
      alert(error.message);
      return;
    }

    const response = await actions.editCat(cat.id, { [field]: parsedValue });
    if (response.success) {
      setEditingFn(false);
      await actions.getCatById(id);
    } else {
      alert(response.message || "Update failed");
    }
  };

  const handleCancelEdit = (setEditingFn) => {
    setEditingFn(false);
  };

  const handleMessageOwner = () => {
    actions.setChatRecipient(cat.owner.id, cat.owner.username || "Owner");
    actions.toggleChatboxOpen(true);
  };

  // Process images: convert stored JSON string to an array
  let imagesArray = [];
  try {
    imagesArray = JSON.parse(cat.image_urls);
  } catch {
    imagesArray = cat.image_urls ? [cat.image_urls] : [];
  }
  if (!Array.isArray(imagesArray)) imagesArray = [];

  // --------------- Append Cat Images Functionality ---------------
  // When files are selected, update state
  const handleImageChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  // Upload selected files using the uploadImage function to get secure URLs,
  // then call the flux action appendCatImages with those URLs.
  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      alert("No images selected");
      return;
    }

    // Use the existing uploadImage function to convert files into URLs
    const uploadedUrls = await actions.uploadImage(selectedFiles);
    if (!uploadedUrls || uploadedUrls.length === 0) {
      alert("Image upload failed");
      return;
    }

    // Call the flux action to append the new image URLs to the cat
    const success = await actions.appendCatImages(cat.id, uploadedUrls);
    if (success) {
      alert("Images updated successfully");
      await actions.getCatById(cat.id);
      setSelectedFiles([]);
    } else {
      alert("Failed to update images");
    }
  };
  // --------------- End Append Cat Images Functionality ---------------

  return (
    <div className="d-flex justify-content-center">
      <div className="cat-template">
        {/* Name Section */}
        <div className="text-center">
          <h1>
            <strong>Name:</strong>{" "}
            {editingName ? (
              <div className="edit-group">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button
                  className="btn-sm btn-success"
                  onClick={() => handleSaveField("name", newName, setEditingName)}
                >
                  Save
                </button>
                <button
                  className="btn-sm btn-secondary"
                  onClick={() => handleCancelEdit(setEditingName)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {cat.name}{" "}
                {isOwner && (
                  <button
                    className="btn-sm btn-warning"
                    onClick={() => setEditingName(true)}
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </h1>
        </div>

        {/* Image Carousel */}
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

        {/* Append Cat Images Block (Below Carousel, Above Details) */}
        {isOwner && (
          <div className="mt-3 text-center">
            {/* Hidden file input triggered by button */}
            <input
              type="file"
              id="catImageUpload"
              multiple
              style={{ display: "none" }}
              onChange={handleImageChange}
              accept="image/*"
            />
            <button
              className="btn btn-info"
              onClick={() => document.getElementById("catImageUpload").click()}
            >
              Update Cat Images
            </button>
            {selectedFiles.length > 0 && (
              <button className="btn btn-success ml-2" onClick={handleUploadImages}>
                Upload Selected Images
              </button>
            )}
          </div>
        )}

        {/* Details Section */}
        <div className="cat-details">
          <p>
            <strong>Breed:</strong>{" "}
            {editingBreed ? (
              <div className="edit-group">
                <input
                  type="text"
                  value={newBreed}
                  onChange={(e) => setNewBreed(e.target.value)}
                />
                <button
                  className="btn-sm btn-success"
                  onClick={() => handleSaveField("breed", newBreed, setEditingBreed)}
                >
                  Save
                </button>
                <button
                  className="btn-sm btn-secondary"
                  onClick={() => handleCancelEdit(setEditingBreed)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {cat.breed}{" "}
                {isOwner && (
                  <button
                    className="btn-sm btn-warning"
                    onClick={() => setEditingBreed(true)}
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </p>
          <p>
            <strong>Age:</strong>{" "}
            {editingAge ? (
              <div className="edit-group">
                <input
                  type="number"
                  min="0"
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                />
                <button
                  className="btn-sm btn-success"
                  onClick={() => handleSaveField("age", newAge, setEditingAge)}
                >
                  Save
                </button>
                <button
                  className="btn-sm btn-secondary"
                  onClick={() => handleCancelEdit(setEditingAge)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {cat.age} years{" "}
                {isOwner && (
                  <button
                    className="btn-sm btn-warning"
                    onClick={() => setEditingAge(true)}
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </p>
          <p>
            <strong>Price:</strong>{" "}
            {editingPrice ? (
              <div className="edit-group">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
                <button
                  className="btn-sm btn-success"
                  onClick={() => handleSaveField("price", newPrice, setEditingPrice)}
                >
                  Save
                </button>
                <button
                  className="btn-sm btn-secondary"
                  onClick={() => handleCancelEdit(setEditingPrice)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                ${cat.price.toFixed(2)}{" "}
                {isOwner && (
                  <button
                    className="btn-sm btn-warning"
                    onClick={() => setEditingPrice(true)}
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </p>
          <p>
            <strong>Description:</strong>{" "}
            {editingDescription ? (
              <div className="edit-group">
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows="3"
                />
                <button
                  className="btn-sm btn-success"
                  onClick={() => handleSaveField("description", newDescription, setEditingDescription)}
                >
                  Save
                </button>
                <button
                  className="btn-sm btn-secondary"
                  onClick={() => handleCancelEdit(setEditingDescription)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {cat.description}{" "}
                {isOwner && (
                  <button
                    className="btn-sm btn-warning"
                    onClick={() => setEditingDescription(true)}
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="cat-actions text-center">
          <button className="btn btn-primary m-1" onClick={handleMessageOwner}>
            Message Owner
          </button>
          <button
            className="btn btn-success m-1"
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
