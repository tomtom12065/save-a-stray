import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Sendtoken = () => {
    // const baseApiUrl = process.env.BACKEND_URL;
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    const sendEmail = async () => {
        if (!email) {
            setErrorMessage("Please enter your email.");
            return;
        }

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/request_reset`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage("If your email is in our system, you will receive a password reset link.");
                setErrorMessage("");
                // Optionally navigate back to login or a confirmation page
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                setErrorMessage(data.error || "An error occurred while requesting the reset link.");
                setSuccessMessage("");
            }
        } catch (error) {
            setErrorMessage("An error occurred while sending the email. Please try again later.");
            setSuccessMessage("");
            console.error("Error sending email:", error);
        }
    };

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
