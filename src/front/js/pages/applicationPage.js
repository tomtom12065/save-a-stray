import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";

const ApplicationPage = () => {
    const [applicantName, setApplicantName] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();

    // Extract catId from query parameters or global state
    const queryParams = new URLSearchParams(location.search);
    const catId = queryParams.get("catId") || store.selectedCatId; // Fallback to global state if no query param

    useEffect(() => {
        if (!catId) {
            setError("No cat selected for application.");
        }
    }, [catId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate input fields
        if (!catId || !applicantName || !contactInfo || !reason) {
            setError("All fields are required.");
            return;
        }

        // Reset error message
        setError("");

        // Prepare application data
        const applicationData = {
            cat_id: catId,
            applicant_name: applicantName,
            contact_info: contactInfo,
            reason: reason,
        };

        // Call the Flux action
        const result = await actions.submitApplication(applicationData);

        if (result) {
            alert("Application submitted successfully!");
            navigate("/"); // Redirect to home page
        } else {
            setError("Failed to submit application. Please try again.");
        }
    };

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
                            placeholder="Enter your email or phone number"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reason">Why do you want to adopt?</label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why you'd be a good match"
                        ></textarea>
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
