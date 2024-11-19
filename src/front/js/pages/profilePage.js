import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/profilePage.css";
import ChatBox from "../component/chatBox"; // Assuming you have a ChatBox component
//add bio for profile
// potential breeder bio
//potential different useres one for breeders and bio
// potential verification for breeders and users also potential id request for buyers
//when you adopt you need to give information ask website to see how they do verification
//add reviews for users
// do reasearch on adoption sites
// add a footer for footer stuff
// link everything with the sidebar
//add potential friends
// make the rest of the project adaptive for all screens
//react native
// posts about project update for linked in
//ask suggestions from platform



const ProfilePage = () => {
  const { store, actions } = useContext(Context);
  const [selectedFile, setSelectedFile] = useState(null);
const [profileimage,setProfileImage] = useState(null);
const [catsRetrieved, setCatsRetrieved] = useState(null)
const token = localStorage.getItem(token)
  useEffect(() => {
    // Fetch user data if not already present
   const getCats = async ()=>{
    let success = await actions.getSelfCats();
    if (success){
      setCatsRetrieved(true)
    }else{
      setCatsRetrieved(false)
    }
   }
    
    getCats()
    
    
    console.log("dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd")
    console.log(store.selfcats)
  }, [store.user, actions]);

  // Handler for file selection
  // const handleFileChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     actions.uploadProfilePic(file).then((response) => {
  //       if (response.success) {
  //         alert("Profile picture updated successfully!");
  //       } else {
  //         alert(response.message);
  //       }
  //     });
  //   }
  // };
  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      setError("Please select an image file.");
      return;
    }

    console.log("File from catUpload before uploadimage ", file)

    
    const imageUrl = await actions.uploadProfilePic(file);
   

  };

  // Handler for clicking the profile picture
  const handleClick = () => {
    document.getElementById("profile-pic-input").click();
  };

  return (
    <div className="profile-page">
      {/* Profile Picture Section */}
      <div className="profile-pic-container" onClick={handleClick}>
        {store.user?.image_url ? (
          <img src={store.user.image_url} alt="Profile" className="profile-pic" />
        ) : (
          <div className="upload-placeholder">Click to upload</div>
        )}
      </div>

      {/* User Information Section */}
      <h2>{store.user?.username}</h2>
      <p>Email: {store.user?.email}</p>

      {/* Hidden file input for profile picture upload */}
      <input
        id="profile-pic-input"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />

      {/* Button to request password reset */}
      <button
        className="btn btn-primary mt-3"
        onClick={() => window.location.href = "/requesting-reset"}
      >
        Request Password Reset
      </button>

      {/* Bootstrap Carousel for User's Cats */}
      {catsRetrieved?(
        <div className="user-cats-carousel mt-5">
          <h3>Your Cats</h3>
          <div id="catsCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              {store.selfcats.map((cat, index) => (
                <div
                  key={cat.id}
                  className={`carousel-item ${index === 0 ? "active" : ""}`}
                >
                  <img
                    src={cat.image_url}
                    className="d-block w-100"
                    alt={cat.name}
                    style={{ height: "300px", objectFit: "cover" }}
                  />
                  <div className="carousel-caption d-none d-md-block">
                    <h5>{cat?.name}</h5>
                    <p>{cat?.breed} - Age: {cat.age}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#catsCarousel"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#catsCarousel"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      ) : catsRetrieved==null?(<p className="mt-5">Loading.</p>): !store.selfcats? (
        <p className="mt-5">You have not uploaded any cats yet.</p>
      ): (<p className="mt-5">An error ocurred, please come back later</p>)}

      {/* Chat Box for Messaging */}
      <div className="chat-box-container">
        <ChatBox recipient="AnotherUser" />
      </div>
    </div>
  );
};

export default ProfilePage;
