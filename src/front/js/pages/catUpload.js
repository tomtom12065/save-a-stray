import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import "../../styles/catPage.css"; // Make sure to include the correct path for your styles

export default function CatUpload() {
    const { actions } = useContext(Context); // Access actions from the context
    const navigate = useNavigate(); // Use navigate for redirection
    // Initial state of the cat
    const [cat, setCat] = useState({ name: '', breed: '', age: '', price: '' });

    // Handle form submission
    const onSubmit = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        try {
            // Call the action to post cat data to the backend
            const response = await actions.postCatData(cat);

            // Check the response status
            if (response.status === 201) {
                navigate("/home"); // Redirect to home on success
            }
        } catch (error) {
            console.error("Error submitting cat data", error); // Log any errors
        }
    };

    return (
        <div className="upload-container">
            <form onSubmit={onSubmit}>
                <label>Name:</label>
                <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => setCat({ ...cat, name: e.target.value })}
                    required
                />
                <label>Age:</label>
                <input
                    type="number"
                    value={cat.age}
                    onChange={(e) => setCat({ ...cat, age: e.target.value })}
                    required
                />
                <label>Breed:</label>
                <input
                    type="text"
                    value={cat.breed}
                    onChange={(e) => setCat({ ...cat, breed: e.target.value })}
                    required
                />
                <label>Price:</label>
                <input
                    type="text"
                    value={cat.price}
                    onChange={(e) => setCat({ ...cat, price: e.target.value })}
                    required
                />
                <button type="submit">Upload Cat</button>
            </form>
        </div>
    );
}
