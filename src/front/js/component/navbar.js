import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import "../../styles/navbar.css";
import { Context } from "../store/appContext";
import { validateUserName, validateEmail, validatePassword } from "../component/validators";

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  // ----- Login / Register state -----
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    username: "",
    profilepic: ""
  });
  const [error, setError] = useState({ login: null, register: null });
  const [isUploading, setIsUploading] = useState(false);
  const [invaliditems, setInvaliditems] = useState([]);

  // ----- Password Reset state -----
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetErrorMessage, setResetErrorMessage] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  // ----- Cat Upload Modal state -----
  const [showCatUploadModal, setShowCatUploadModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState([]); // Array of File objects
  const [previewImages, setPreviewImages] = useState([]); // Array of preview URLs
  const [description, setDescription] = useState("");
  const [catUploadError, setCatUploadError] = useState("");

  // ----- Fetch breed data if not already loaded -----
  useEffect(() => {
    if (store.breeds.length === 0) {
      actions.getBreeds();
    }
  }, [store.breeds, actions]);

  // ----- Login Handler -----
  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError({ ...error, login: null });
    const response = await actions.loginUser(loginData);
    if (response.success) {
      setShowLoginModal(false);
      navigate("/");
    } else {
      setError({ ...error, login: response.message });
    }
  };

  // ----- Register Handler -----
  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setError({ ...error, register: null });
    setInvaliditems([]);

    const validUsername = validateUserName(registerData.username, setInvaliditems);
    const validEmail = validateEmail(registerData.email);
    const validPassword = validatePassword(registerData.password);

    if (!validEmail) setInvaliditems((prev) => [...prev, "email"]);
    if (!validPassword) setInvaliditems((prev) => [...prev, "password"]);

    if (validUsername && validEmail && validPassword) {
      try {
        const response = await actions.registerUser(registerData);
        if (response.success) {
          setShowRegisterModal(false);
          navigate("/");
        } else {
          setError({ ...error, register: response.message });
        }
      } catch (err) {
        setError({ ...error, register: "Registration failed. Please try again." });
      }
    }
  };

  // ----- Password Reset Handler -----
  const sendResetEmail = async () => {
    if (!resetEmail) {
      setResetErrorMessage("Please enter your email.");
      return;
    }
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/request_reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setResetSuccessMessage("If your email is in our system, you will receive a password reset link.");
        setResetErrorMessage("");
        setTimeout(() => {
          setShowResetModal(false);
          navigate("/login");
        }, 3000);
      } else {
        setResetErrorMessage(data.error || "An error occurred while requesting the reset link.");
        setResetSuccessMessage("");
      }
    } catch (error) {
      setResetErrorMessage("An error occurred while sending the email. Please try again later.");
      setResetSuccessMessage("");
      console.error("Error sending reset email:", error);
    }
  };

  // ----- Cat Upload Handler -----
  const handleCatUploadSubmit = async (e) => {
    e.preventDefault();
    if (!catName || !breed || !age || !price || image.length === 0) {
      setCatUploadError("All fields are required.");
      return;
    }
    setCatUploadError("");
    const formData = new FormData();
    formData.append("name", catName);
    formData.append("breed", breed);
    formData.append("age", age);
    formData.append("price", price);
    formData.append("description", description);
    image.forEach((file) => {
      formData.append("image", file);
    });
    const result = await actions.postCatData2(formData);
    if (result && result.success) {
      alert("Cat uploaded successfully!");
      // Reset fields
      setCatName("");
      setBreed("");
      setAge("");
      setPrice("");
      setImage([]);
      setDescription("");
      setPreviewImages([]);
      setShowCatUploadModal(false);
      navigate("/");
    } else {
      setCatUploadError(result.message || "Failed to upload cat. Please try again.");
    }
  };

  const resetForms = () => {
    setLoginData({ username: "", password: "" });
    setRegisterData({ email: "", password: "", username: "", profilepic: "" });
    setError({ login: null, register: null });
    setInvaliditems([]);
  };

  // ----- Cat Upload Form Component for Modal -----
  const renderCatUploadForm = () => (
    <div className="container cat-upload-div mt-4">
      <div className="text-center mb-4">
        <h2>Upload Cat</h2>
      </div>
      <div className="d-flex justify-content-center">
        <form className="cat-upload-form" onSubmit={handleCatUploadSubmit}>
          {catUploadError && <p className="error-message">{catUploadError}</p>}

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
          <h5>
            We recommend a minimum rehome fee of $100 to discourage bad actors from applying for these pets
          </h5>
          <label htmlFor="price">Rehome fee (USD):</label>
          <input
            id="price"
            type="number"
            value={price}
            min="100"
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            required
          />

          <label htmlFor="description">Description:</label>
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
              // Convert FileList to array
              const newFiles = Array.from(e.target.files);
              setImage((prevFiles) => [...prevFiles, ...newFiles]);
              // Generate preview URLs
              const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
              setPreviewImages((prevPreviews) => [...prevPreviews, ...newPreviews]);
            }}
            required
          />

          <div className="image-preview">
            {previewImages.map((src, index) => (
              // Each preview image is wrapped in its own container for later styling.
              <div key={index} className="uploaded-image-container">
                <img src={src} alt={`Preview ${index}`} style={{ width: "100px", marginRight: "10px" }} />
              </div>
            ))}
          </div>

          <button type="submit">Upload Cat</button>
        </form>
      </div>
    </div>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link to="/" className="navbar-brand mb-0 h1">
          Save A Stray
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            {/* Cat Upload Nav Item always opens a modal */}
            <li className="nav-item">
              <Button variant="link" className="nav-link" onClick={() => setShowCatUploadModal(true)}>
                Cat Upload
              </Button>
            </li>
            {!store.token ? (
              <>
                <li className="nav-item">
                  <Button
                    variant="link"
                    className="nav-link"
                    onClick={() => {
                      setShowLoginModal(true);
                      resetForms();
                    }}
                  >
                    Login
                  </Button>
                </li>
                <li className="nav-item">
                  <Button
                    variant="link"
                    className="nav-link"
                    onClick={() => {
                      setShowRegisterModal(true);
                      resetForms();
                    }}
                  >
                    Register
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/inbox" className="nav-link">
                    Inbox
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/profile" className="nav-link">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" onClick={() => actions.logout()}>
                    Logout
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Button variant="link" className="nav-link" onClick={() => setShowResetModal(true)}>
                Forgot Password?
              </Button>
            </li>
          </ul>
        </div>
      </div>

      {/* ----- Modals ----- */}

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error.login && <div className="alert alert-danger">{error.login}</div>}
          <Form onSubmit={handleLoginSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Login
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Register Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error.register && <div className="alert alert-danger">{error.register}</div>}
          <Form onSubmit={handleRegisterSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                isInvalid={invaliditems.includes("email")}
              />
              {invaliditems.includes("email") && (
                <Form.Control.Feedback type="invalid">
                  Please enter a valid email address
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRegUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
                isInvalid={invaliditems.includes("user_name")}
              />
              {invaliditems.includes("user_name") && (
                <Form.Control.Feedback type="invalid">
                  Username must be 2-25 characters
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRegPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                isInvalid={invaliditems.includes("password")}
              />
              {invaliditems.includes("password") && (
                <Form.Control.Feedback type="invalid">
                  Password must be at least 8 characters with uppercase, number, and special character
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProfilePic">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setIsUploading(true);
                  try {
                    const uploadedImageUrl = await actions.uploadImage(file);
                    setRegisterData({
                      ...registerData,
                      profilepic: uploadedImageUrl
                    });
                    setError({ ...error, register: null });
                  } catch (err) {
                    setError({
                      ...error,
                      register: "Failed to upload image. Please try again."
                    });
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
              {isUploading && <div className="text-muted small mt-1">Uploading image...</div>}
              {registerData.profilepic && (
                <div className="mt-2">
                  <img
                    src={registerData.profilepic}
                    alt="Preview"
                    style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "50%" }}
                  />
                </div>
              )}
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={isUploading}>
                {isUploading ? "Registering..." : "Create Account"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Password Reset Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>Request Password Reset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resetErrorMessage && <p className="text-danger text-center">{resetErrorMessage}</p>}
          {resetSuccessMessage && <p className="text-success text-center">{resetSuccessMessage}</p>}
          <Form>
            <Form.Group controlId="formResetEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={sendResetEmail}>
            Send Email
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cat Upload Modal (always a modal, not a separate page) */}
      <Modal show={showCatUploadModal} onHide={() => setShowCatUploadModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Upload Cat</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderCatUploadForm()}</Modal.Body>
      </Modal>
    </nav>
  );
};
