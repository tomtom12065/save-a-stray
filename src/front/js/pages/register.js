import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/register.css";
import { ValidateUserName } from "../component/validators";
const Register = () => {
  const { actions } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username,setUsername] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [invaliditems, setInvaliditems] = useState([])

  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setInvaliditems([]);
    setError(null);

    let isUsernameValid = ValidateUserName(username,setInvaliditems)
    if(isUsernameValid){


      try {
        const userData = {
          email: email,
          password: password,
          username:username
        };
  
        console.log("Submitting user data:", userData);
  
        const response = await actions.registerUser(userData);
        console.log("test 3");
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
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>Username</label>
        <input
          type= "text"
            value = {username}
          onChange={(e)=> setUsername(e.target.value)}
          required
          />

          {invaliditems.includes("user_name") && <label className="error-label">username must be between 2 and 25 characters</label>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
