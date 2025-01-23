// (1) Importing React, additional hooks, and our Context
import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Context } from "../store/appContext";

// (2) This component handles the resetting of a user's password using a token.
export const ResetPassword = () => {
  // (2a) Access the global actions from Context
  const { actions } = useContext(Context);

  // (2b) Using a hook to retrieve query parameters (search params) from the URL
  const [searchParams] = useSearchParams();

  // (2c) For programmatic navigation after successful reset
  const navigate = useNavigate();

  // (3) Local component states for managing password input fields and error messages
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // (4) Extracting the token from the URL query string (?token=XXXXXX)
  const token = searchParams.get("token");

  // (5) onSubmit function: Triggered when user submits the form to reset password
  const onSubmit = async (event) => {
    event.preventDefault(); // Prevent default page reload

    // (5a) Check if token is present
    if (!token) {
      setErrorMessage("Token is required.");
      return;
    }

    // (5b) Check if both password fields match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      // (5c) Make a PUT request to backend with token in Authorization header
      const response = await fetch(`${process.env.BACKEND_URL}/api/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          new_password: password,
        }),
      });

      // (5d) Parse the JSON response from the server
      const data = await response.json();

      // (5e) If the response is OK, navigate to login page
      if (response.ok) {
        navigate("/login");
      } else {
        setErrorMessage(data.error || "An error occurred during password reset.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while resetting the password.");
      console.error("Error during password reset:", error);
    }
  };

  // (6) JSX layout for the password reset form
  return (
    <div className="container">
      <h1>Reset Password</h1>
      {errorMessage && <p className="text-danger">{errorMessage}</p>}
      <form onSubmit={onSubmit}>
        <label htmlFor="passwordInput">New Password</label>
        <input
          id="passwordInput"
          className="form-control m-3"
          type="password"
          value={password}
          placeholder="New Password"
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <label htmlFor="confirmPasswordInput">Confirm New Password</label>
        <input
          id="confirmPasswordInput"
          className="form-control m-3"
          type="password"
          value={confirmPassword}
          placeholder="Confirm New Password"
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <button className="btn btn-primary" type="submit">
          Reset Password
        </button>
      </form>
    </div>
  );
};
