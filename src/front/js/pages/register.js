// (1) Importing the necessary modules and context
import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/register.css";
// (2) Importing validator functions for username, email, and password
import { validateUserName } from "../component/validators";
import { validateEmail, validatePassword } from "../component/validators";

// (3) Register component: Displays a form for new users to register.
const Register = () => {
  // (3a) Destructure actions from our global store's context
  const { actions } = useContext(Context);

  // (3b) useState hooks to manage form fields and status messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profilepic, setProfilepic] = useState(null); // URL for uploaded profile image
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [invaliditems, setInvaliditems] = useState([]);

  // (3c) Used to navigate to other routes after successful registration
  const navigate = useNavigate();

  // (4) Function: Handles profile picture upload when a file is selected
  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    console.log("Selected file for profile picture:", file);

    if (!file) {
      setError("Please select an image file.");
      console.log("Error: No file selected.");
      return;
    }

    setIsUploading(true);
    try {
      console.log("Uploading image...");
      // (4a) Calls 'uploadImage' from actions to handle the actual upload
      const uploadedImageUrl = await actions.uploadImage(file);
      console.log("Image uploaded successfully:", uploadedImageUrl);
      setIsUploading(false);

      if (uploadedImageUrl) {
        // (4b) Store the uploaded image URL in our state
        setProfilepic(uploadedImageUrl);
        setError(null);
      } else {
        setError("Failed to upload image. Please try again.");
        console.log("Error: Failed to upload image.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setIsUploading(false);
      setError("An unexpected error occurred during image upload.");
    }
  };

  // (5) Function: Handles form submission for user registration
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevents default form reload
    setInvaliditems([]);
    setError(null);
    setSuccess(null);

    console.log("Form submission started with values:", {
      email,
      password,
      username,
      profilepic,
    });

    // (5a) Validate username
    const isUsernameValid = validateUserName(username, setInvaliditems);
    console.log("Username validation result:", isUsernameValid);

    // (5b) Validate email
    const isEmailValid = validateEmail(email);
    console.log("Email validation result:", isEmailValid);
    if (!isEmailValid) {
      setInvaliditems((prev) => [...prev, "email"]);
    }

    // (5c) Validate password
    const isPasswordValid = validatePassword(password);
    console.log("Password validation result:", isPasswordValid);
    if (!isPasswordValid) {
      setInvaliditems((prev) => [...prev, "password"]);
    }

    // (5d) If all validations pass, proceed with registration
    if (isUsernameValid && isEmailValid && isPasswordValid) {
      try {
        // (5e) Data object to send to the registration action
        const userData = {
          email,
          password,
          username,
          profilepic,
        };

        console.log("Submitting user data:", userData);

        // (5f) Calls the registerUser action to handle the API request
        const response = await actions.registerUser(userData);
        console.log("Registration response:", response);

        // (5g) If registration is successful, display success and navigate
        if (response.success) {
          setSuccess("Registration successful!");
          console.log("Registration successful. Redirecting...");
          navigate("/"); // Redirect to the home page
        } else {
          // (5h) If registration fails, show an error message
          setError(response.message || "Failed to register. Please try again.");
          console.log("Error: Registration failed with message:", response.message);
        }
      } catch (error) {
        console.error("Error registering user:", error);
        setError("An unexpected error occurred.");
      }
    } else {
      console.log("Validation failed. Invalid items:", invaliditems);
    }
  };

  // (6) JSX structure for the register form
  //     Referenced by 'handleSubmit' on form submission and 'handleProfilePicChange' on file upload
  return (
    <div className="register-container">
      <h2>Register</h2>
      {/* (6a) Form with error and success messages */}
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {invaliditems.includes("email") && (
          <label className="error-label">
            Please enter a valid email address.
          </label>
        )}

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {invaliditems.includes("password") && (
          <label className="error-label">
            Password must be at least 8 characters, include a capital letter, a
            number, and a special character.
          </label>
        )}

        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {invaliditems.includes("user_name") && (
          <label className="error-label">
            Username must be between 2 and 25 characters.
          </label>
        )}

        <label>Profile Picture (optional):</label>
        <input
          type="file"
          onChange={handleProfilePicChange}
          accept="image/*"
        />
        {isUploading && <p>Uploading image...</p>}

        <button type="submit" disabled={isUploading}>
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
