// (1) Importing necessary modules from React, React Router, and our global Context
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";

// (2) This component allows a user to submit an adoption application for a specific cat.
const ApplicationPage = () => {
  // (2a) useState hooks for managing form fields and error messages
  const [applicantName, setApplicantName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // (2b) Accessing global store and actions from Context
  const { store, actions } = useContext(Context);

  // (2c) React Router hooks to navigate and read URL parameters
  const navigate = useNavigate();
  const location = useLocation();

  // (3) Extract catId from query parameters or fallback to a global state variable
  const queryParams = new URLSearchParams(location.search);
  const catId = queryParams.get("catId") || store.selectedCatId;

  // (4) If no catId is found, set an error message
  useEffect(() => {
    if (!catId) {
      setError("No cat selected for application.");
    }
  }, [catId]);

  // (5) Submit handler for the adoption application form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // (5a) Validate all required fields
    if (!catId || !applicantName || !contactInfo || !reason) {
      setError("All fields are required.");
      return;
    }
    setError("");

    // (5b) Prepare the application data object
    const applicationData = {
      cat_id: catId,
      applicant_name: applicantName,
      contact_info: contactInfo,
      reason: reason,
    };

    // (5c) Submit application via a Flux action
    const result = await actions.submitApplication(applicationData);

    // (5d) If successful, alert user and navigate home
    if (result) {
      alert("Application submitted successfully!");
      navigate("/");
    } else {
      setError("Failed to submit application. Please try again.");
    }
  };

  // (6) Render the application form if catId is present, otherwise prompt to select a cat
  return (
    <div className="application-page">
      <h1>Adoption Application</h1>
      {error && <div className="error-message">{error}</div>}
      {catId ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="applicantName">Your Name</label>
            <input
              type="text"
              id="applicantName"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactInfo">Contact Information</label>
            <input
              type="text"
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reason">Why do you want to adopt?</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you'd be a good match"
            />
          </div>
          <button type="submit">Submit Application</button>
        </form>
      ) : (
        <p>Please select a cat to apply for adoption.</p>
      )}
    </div>
  );
};

export default ApplicationPage;
