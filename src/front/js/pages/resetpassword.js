import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Context } from "../store/appContext";

export const ResetPassword = () => {
    const { actions } = useContext(Context);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const token = searchParams.get("token");

    const onSubmit = async (event) => {
        event.preventDefault();

        if (!token) {
            setErrorMessage("Token is required.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
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

            const data = await response.json();

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
