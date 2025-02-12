import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import "../../styles/navbar.css";
import { Context } from "../store/appContext";
import { validateUserName, validateEmail, validatePassword } from "../component/validators";

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    username: "",
    profilepic: ""
  });
  const [error, setError] = useState({ login: null, register: null });
  const [isUploading, setIsUploading] = useState(false);
  const [invaliditems, setInvaliditems] = useState([]);
  const navigate = useNavigate();

  // Login Handlers
  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError({ ...error, login: null });
    const response = await actions.loginUser(loginData);

    if (response.success) {
      setShowLoginModal(false);
      navigate("/");
    } else {
      setError({ ...error, login: response.message });
    }
  };

  // Registration Handlers
  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setError({ ...error, register: null });
    setInvaliditems([]);

    // Validate fields
    const validUsername = validateUserName(registerData.username, setInvaliditems);
    const validEmail = validateEmail(registerData.email);
    const validPassword = validatePassword(registerData.password);

    if (!validEmail) setInvaliditems(prev => [...prev, 'email']);
    if (!validPassword) setInvaliditems(prev => [...prev, 'password']);

    if (validUsername && validEmail && validPassword) {
      try {
        const response = await actions.registerUser(registerData);
        if (response.success) {
          setShowRegisterModal(false);
          navigate("/");
        } else {
          setError({ ...error, register: response.message });
        }
      } catch (err) {
        setError({ ...error, register: "Registration failed. Please try again." });
      }
    }
  };

  const resetForms = () => {
    setLoginData({ username: "", password: "" });
    setRegisterData({ email: "", password: "", username: "", profilepic: "" });
    setError({ login: null, register: null });
    setInvaliditems([]);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link to="/" className="navbar-brand mb-0 h1">
          Save A Stray
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/cat-upload" className="nav-link">Cat Upload</Link>
            </li>
            
            {!store.token ? (
              <>
                <li className="nav-item">
                  <Button 
                    variant="link" 
                    className="nav-link"
                    onClick={() => {
                      setShowLoginModal(true);
                      resetForms();
                    }}
                  >
                    Login
                  </Button>
                </li>
                <li className="nav-item">
                  <Button 
                    variant="link" 
                    className="nav-link"
                    onClick={() => {
                      setShowRegisterModal(true);
                      resetForms();
                    }}
                  >
                    Register
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/inbox" className="nav-link">Inbox</Link>
                </li>
                <li className="nav-item">
                  <Link to="/profile" className="nav-link">Profile</Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="nav-link"
                    onClick={() => actions.logout()}
                  >
                    Logout
                  </Link>
                </li>
              </>
            )}

            <li className="nav-item">
              <Link to="/requesting-reset" className="nav-link">Forgot Password?</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Login Modal */}
      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error.login && <div className="alert alert-danger">{error.login}</div>}
          <Form onSubmit={handleLoginSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Login
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Register Modal */}
      <Modal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error.register && <div className="alert alert-danger">{error.register}</div>}
          <Form onSubmit={handleRegisterSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                isInvalid={invaliditems.includes('email')}
              />
              {invaliditems.includes('email') && (
                <Form.Control.Feedback type="invalid">
                  Please enter a valid email address
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRegUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
                isInvalid={invaliditems.includes('user_name')}
              />
              {invaliditems.includes('user_name') && (
                <Form.Control.Feedback type="invalid">
                  Username must be 2-25 characters
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRegPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                isInvalid={invaliditems.includes('password')}
              />
              {invaliditems.includes('password') && (
                <Form.Control.Feedback type="invalid">
                  Password must be at least 8 characters with uppercase, number, and special character
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formProfilePic">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  setIsUploading(true);
                  try {
                    const uploadedImageUrl = await actions.uploadImage(file);
                    setRegisterData({ 
                      ...registerData, 
                      profilepic: uploadedImageUrl 
                    });
                    setError({ ...error, register: null });
                  } catch (err) {
                    setError({ 
                      ...error, 
                      register: "Failed to upload image. Please try again." 
                    });
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
              {isUploading && <div className="text-muted small mt-1">Uploading image...</div>}
              {registerData.profilepic && (
                <div className="mt-2">
                  <img 
                    src={registerData.profilepic} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: "100px", 
                      maxHeight: "100px",
                      borderRadius: "50%"
                    }} 
                  />
                </div>
              )}
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit"
                disabled={isUploading}
              >
                {isUploading ? 'Registering...' : 'Create Account'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </nav>
  );
};