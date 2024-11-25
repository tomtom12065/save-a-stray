import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);

  const toggleSidebar = () => {
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("sidebar-open");
  };

  // Logout handler
  const handleLogout = () => {
    actions.logout();
    toggleSidebar();
    navigate("/");
  };

  const isLoggedIn = store.user || localStorage.getItem("user");

  return (
    <>
      {/* Hamburger Menu Button */}
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        ☰ Menu
      </button>

      <div className="sidebar">
        <button className="close-btn" onClick={toggleSidebar}>&times;</button>
        <h2>Menu</h2>

        {!isLoggedIn ? (
          <div className="sidebar-buttons">
            <button 
              className="sidebar-btn btn btn-primary" 
              onClick={() => {
                toggleSidebar();
                navigate("/login");

              }}
            >
              Login
            </button>
            <button 
              className="sidebar-btn btn btn-secondary mt-2" 
              onClick={() => {
                toggleSidebar();
                navigate("/register");
              }}
            >
              Register
            </button>
            <button 
              className="sidebar-btn btn btn-secondary mt-2" 
              onClick={() => {
                toggleSidebar();
                navigate("/requesting-reset");
              }}
            >
              Forgot Password?
            </button>
          </div>
        ) : (
          <div className="sidebar-buttons">
            <button 
              className="sidebar-btn btn btn-primary" 
              onClick={() => {
                toggleSidebar();
                navigate("/profile");
              }}
            >
              View Your Cats
            </button>
            <button 
              className="sidebar-btn btn btn-success mt-2" 
              onClick={() => {
                toggleSidebar();
                navigate("/cat-upload");
              }}
            >
              Upload Cat
            </button>
            <button 
              className="sidebar-btn btn btn-secondary mt-2" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;


// import React, { useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { Context } from "../store/appContext";
// import "../../styles/sidebar.css";

// // const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const Sidebar = ({ isOpen}) => {

//   const navigate = useNavigate();
//   const { store, actions } = useContext(Context);

//   // Logout handler
//   const handleLogout = () => {
//     actions.logout();
//     toggleSidebar();  // Close sidebar after logging out
//     navigate("/");
//   };

//   const toggleSidebar =()=>{
//     const sidebar = document.querySelector(".sidebar");
//     const mainContent = document.querySelector(".mainContent");

//     sidebar.classList.toggle("open");
//     mainContent.classList.toggle("sidebar-closed")
    
//   }


//   // Navigate to the reset password request page
//   const handlePasswordResetRequest = () => {
//     toggleSidebar();  // Close sidebar after navigation
//     navigate("/requesting-reset");
//   };

//   // Navigate to the upload cat page
//   const handleUploadCat = () => {
//     toggleSidebar();  // Close sidebar after navigation
//     navigate("/cat-upload");
//   };

//   // Navigate to the login page
//   const handleLogin = () => {
//     actions.loginUser
//     toggleSidebar();  // Close sidebar after navigation
//     navigate("/login");
//   };

//   return (
//     <div className={`sidebar ${isOpen ? "open" : ""}`}>
//       <button className="close-btn" onClick={toggleSidebar}>&times;</button>
//       <h2>Menu</h2>

//       {/* Conditional buttons for not logged-in users */}
//       {!store.user ? (
//         <>
//           <button className="sidebar-btn btn btn-primary" onClick={handleLogin}>
//             Login
//           </button>
//           <button className="sidebar-btn btn btn-secondary mt-2" onClick={() => navigate("/register")}>
//             Register
//           </button>
//           <button className="sidebar-btn btn btn-secondary mt-2" onClick={handlePasswordResetRequest}>
//             Forgot Password?
//           </button>
//         </>
//       ) : (
//         // Conditional buttons for logged-in users
//         <>
//           <button className="sidebar-btn btn btn-primary" onClick={() => navigate("/your-cats")}>
//             View Your Cats
//           </button>
//           <button className="sidebar-btn btn btn-success mt-2" onClick={handleUploadCat}>
//             Upload Cat
//           </button>
//           <button className="sidebar-btn btn btn-secondary mt-2" onClick={handleLogout}>
//             Logout
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// export default Sidebar;
