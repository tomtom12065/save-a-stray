import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/register.css";
import { validateUserName } from "../component/validators";
import { validateEmail, validatePassword } from "../component/validators"; // Ensure these are implemented in `validators.js`

const Register = () => {
  const { actions } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profilepic, setProfilepic] = useState(null); // Uploaded image URL
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [invaliditems, setInvaliditems] = useState([]);
  const navigate = useNavigate();

  // Handle Profile Picture Upload
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
      const uploadedImageUrl = await actions.uploadImage(file); // Call uploadImage action
      console.log("Image uploaded successfully:", uploadedImageUrl);
      setIsUploading(false);

      if (uploadedImageUrl) {
        setProfilepic(uploadedImageUrl); // Set the profile pic URL
        setError(null); // Clear error if successful
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setInvaliditems([]);
    setError(null);
    setSuccess(null);

    console.log("Form submission started with values:", {
      email,
      password,
      username,
      profilepic,
    });

    // Username Validation
    const isUsernameValid = validateUserName(username, setInvaliditems);
    console.log("Username validation result:", isUsernameValid);

    // Email Validation
    const isEmailValid = validateEmail(email);
    console.log("Email validation result:", isEmailValid);
    if (!isEmailValid) {
      setInvaliditems((prev) => [...prev, "email"]);
    }

    // Password Validation
    const isPasswordValid = validatePassword(password);
    console.log("Password validation result:", isPasswordValid);
    if (!isPasswordValid) {
      setInvaliditems((prev) => [...prev, "password"]);
    }

    if (isUsernameValid && isEmailValid && isPasswordValid) {
      try {
        const userData = {
          email,
          password,
          username,
          profilepic, // Include profile picture URL
        };

        console.log("Submitting user data:", userData);

        const response = await actions.registerUser(userData);
        console.log("Registration response:", response);

        if (response.success) {
          setSuccess("Registration successful!");
          console.log("Registration successful. Redirecting...");
          navigate("/"); // Redirect on successful registration
        } else {
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

  return (
    <div className="register-container">
      <h2>Register</h2>
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
