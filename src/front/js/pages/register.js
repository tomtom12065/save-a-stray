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
  const [error, setError] = useState(null);
  const [invaliditems, setInvaliditems] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setInvaliditems([]);
    setError(null);

    // Username Validation
    const isUsernameValid = validateUserName(username, setInvaliditems);

    // Email Validation
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      setInvaliditems((prev) => [...prev, "email"]);
    }

    // Password Validation
    const isPasswordValid = validatePassword(password);
    if (!isPasswordValid) {
      setInvaliditems((prev) => [...prev, "password"]);
    }

    if (isUsernameValid && isEmailValid && isPasswordValid) {
      try {
        const userData = {
          email: email,
          password: password,
          username: username,
        };

        console.log("Submitting user data:", userData);

        const response = await actions.registerUser(userData);
        if (response.status === 201) {
          navigate("/"); // Redirect on successful registration
        } else {
          setError(response.error || "Failed to register. Please try again.");
        }
      } catch (error) {
        console.error("Error registering user", error);
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
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
        <label>Username</label>
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
