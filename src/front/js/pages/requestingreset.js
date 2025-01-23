// (1) Importing necessary modules from React and React Router
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// (2) This component allows users to request a password reset via email.
export const Sendtoken = () => {
  // (3) useState hooks for managing form data and messages
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // (4) For navigation once the request is processed
  const navigate = useNavigate();

  // (5) Function: Sends a password reset request to the backend API
  const sendEmail = async () => {
    if (!email) {
      setErrorMessage("Please enter your email.");
      return;
    }

    try {
      // (5a) Makes a POST request to the server endpoint with the entered email
      const response = await fetch(`${process.env.BACKEND_URL}/api/request_reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // (5b) Parse the response as JSON
      const data = await response.json();
      console.log(data);

      // (5c) If the request is successful, display a success message and redirect after a delay
      if (response.ok) {
        setSuccessMessage("If your email is in our system, you will receive a password reset link.");
        setErrorMessage("");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        // (5d) If there's an error from the server, show an error message
        setErrorMessage(data.error || "An error occurred while requesting the reset link.");
        setSuccessMessage("");
      }
    } catch (error) {
      // (5e) Catch any network or other errors
      setErrorMessage("An error occurred while sending the email. Please try again later.");
      setSuccessMessage("");
      console.error("Error sending email:", error);
    }
  };

  // (6) JSX to render the request form and messages on the screen
  return (
    <div className="row">
      <div className="col-4"></div>
      <div className="col-4">
        <h3 className="text-center mt-3">Request Password Reset</h3>

        {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
        {successMessage && <p className="text-success text-center">{successMessage}</p>}

        <input
          id="confirmEmail"
          className="form-control text-center mt-3 send-email"
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <div className="text-center">
          <button className="btn btn-primary mt-3" onClick={sendEmail}>
            Send Email
          </button>
        </div>
      </div>
      <div className="col-4"></div>
    </div>
  );
};
