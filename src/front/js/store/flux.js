const getState = ({ getStore, getActions ,setStore }) => {
  //  getaction lets you use functions within the flux in other functions
  // Helper function to retrieve token
  const getToken = () => localStorage.getItem("token");
  console.log(getStore.token)
  return {
    store: {
      message: null,
      cats: [],
      user: JSON.parse(localStorage.getItem("user")) || null,
      selfcats: [],
      token: localStorage.getItem("token") || null,
    },

    actions: {
      // **Message Actions**
      getMessage: async () => {
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/hello`);
          const data = await resp.json();
          setStore({ message: data.message });
          return data;
        } catch (error) {
          console.error("Error loading message from backend", error);
        }
      },
      getBreeds: async () => {
        try {
          const response = await fetch("https://api.thecatapi.com/v1/breeds", {
            headers: {
              "x-api-key": process.env.CAT_API_KEY, // Securely retrieved API key
            },
          });
      
          if (!response.ok) {
            throw new Error(`Error fetching breeds: ${response.statusText}`);
          }
      
          const breeds = await response.json();
          // Map the response to only the breed names
          setStore({ breeds: breeds.map((breed) => breed.name) });
          console.log("Breeds fetched successfully:", breeds.map((breed) => breed.name));
        } catch (error) {
          console.error("Error fetching cat breeds:", error);
        }
      },
      
    
  

      markMessagesAsRead: async (senderId, recipientId) => {
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/api/mark_as_read`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ sender_id: senderId, recipient_id: recipientId }),
          });
      
          if (!response.ok) {
            throw new Error("Failed to mark messages as read.");
          }
      
          console.log("Messages marked as read.");
          const data = await response.json();
          return data.updated_count; // Number of messages marked as read
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      },
      


      updateUser: async (userInfo) => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/update_user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(userInfo),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update user");
            }
    
            const updatedUser = await response.json();
            setStore({ user: updatedUser.user }); // Update user in the store
            return true; // Indicate success
        } catch (error) {
            console.error("Error updating user:", error);
            return false; // Indicate failure
        }
    },









      getMessages: async (recipientId) => {
        try {
            const response = await fetch(
                `${process.env.BACKEND_URL}/api/get_message?recipient_id=${recipientId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // Optional if authentication is required
                    },
                }
            );
    
            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }
    
            const messages = await response.json();
            setStore({ messages }); // Update store with fetched messages
            return messages;
        } catch (error) {
            console.error("Error fetching messages:", error);
            return null; // Return null on failure
        }
    },

    




    sendMessage: async (senderId, recipientId, text) => {
      try {
        const payload = {
          sender_id: senderId,
          recipient_id: recipientId,
          text: text,
        };
        console.log("Sending payload:", payload);
    
        const response = await fetch(`${process.env.BACKEND_URL}/api/send_message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        });
    
        console.log("Response status:", response.status);
    
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend Error:", errorData);
          throw new Error("Failed to send message");
        }
    
        const result = await response.json();
        console.log("Message sent successfully:", result);
        return result;
      } catch (error) {
        console.error("Error sending message:", error);
        return null;
      }
    },
    
  






      // **User Authentication Actions**
     
      getUserData: async (token) => {
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/api/user`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
      
          if (!response.ok) {
            const error = await response.json();
            console.error("Failed to retrieve user data:", error);
            return { success: false, message: error.error || "User data retrieval failed" };
          }
      
          const data = await response.json();
          console.log("User data retrieved:", data);
      
          // Update the global state with user information
          setStore({ user: data });
      
          return { success: true };
        } catch (error) {
          console.error("Error fetching user data:", error);
          return { success: false, message: error.message };
        }
      },
      
     
     
     
     
      registerUser: async (userData) => {
        try {
          console.log("Starting registration process in register_user.");
          const url = `${process.env.BACKEND_URL}/api/register`;
      
          // Include profile picture in the payload
          const bodyData = JSON.stringify({
            email: userData.email,
            password: userData.password,
            username: userData.username,
            profilepic: userData.profilepic || null, // Optional field
          });
      
          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: bodyData,
          });
      
          if (!resp.ok) {
            const errorData = await resp.json();
            return { success: false, message: errorData.error || "Error registering user" };
          }
      
          const data = await resp.json();
          if (data && data.user) {
            setStore({ user: data.user });
            return { success: true, message: "User registered successfully", status: 201 };
          } else {
            return { success: false, message: "No user data received from server" };
          }
        } catch (error) {
          console.error("Error occurred during registration process:", error);
          return { success: false, message: error.message };
        }
      },
      
  
      loginUser: async (userData) => {
        console.log("loginUser called with userData:", userData);
      
        try {
          const backendUrl = process.env.BACKEND_URL;
          console.log("Backend URL:", backendUrl);
      
          const endpoint = `${backendUrl}/api/login`;
          console.log("Login endpoint:", endpoint);
      
          const requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          };
          console.log("Request options:", requestOptions);
      
          const resp = await fetch(endpoint, requestOptions);
          console.log("Fetch response received:", resp);
      
          const data = await resp.json();
          console.log("Response JSON data:", data);
      
          console.log("Response status OK?", resp.ok);
          if (!resp.ok) {
            const errorMessage = data.error || "Error logging in";
            console.error("Login failed:", errorMessage);
            return { success: false, message: errorMessage };
          }
      
          console.log("Login successful. Data received:", data);
          console.log("Store updated with user and token:", { user: data.user, token: data.access_token });
      
          // Save the tokens to localStorage
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setStore({ user: data.user, token: data.access_token });
          const actions = getActions()
          actions.getMessages(data.user.id)
          console.log("Tokens saved to localStorage:", data.access_token, data.refresh_token);
          
          return { success: true, message: "Login successful" };
        } catch (error) {
          console.error("An error occurred during login:", error);
          return { success: false, message: error.message };
        }
      },
      

      logout: () => {
        console.log("Logging out...");
        localStorage.removeItem("token"); // Remove token from local
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user"); 
        setStore({ user: null, token: null }); // Reset user and token in store
      },

      // **Cat Actions**
      postCatData: async (cat) => {
        const data = JSON.stringify({ name: cat.name, breed: cat.breed, age: cat.age, price: cat.price, image_url: cat.imageUrl });
  
        const response = await fetch(`${process.env.BACKEND_URL}/api/add-cat`, {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
          },
          body: data
        });
  
        if (response.status === 201) {
          return {
            success: true,
            message: "Cat added successfully",
            data: response.cat
          };
        } else {
          return {
            success: false,
            message: response.error || "Failed to add cat"
          };
        }
      },
  
      postCatData2: async (cat) => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            return { success: false, message: "User is not authenticated" };
          }
      
          // If no imageUrl is provided, attempt to upload the image
          if (!cat.image_url) {
            const uploadedUrl = await getActions().uploadImage(cat.file); // Pass the file directly for upload
            if (!uploadedUrl) {
              return { success: false, message: "Image upload failed. Please try again." };
            }
            cat.image_url = uploadedUrl; // Assign the uploaded image URL to the cat object
          }
      
          // Prepare the cat data for the API request
          const data = JSON.stringify({
            name: cat.name,
            breed: cat.breed,
            age: cat.age,
            price: cat.price,
            image_url: cat.image_url,
          });
      
          // Make the API request to add the cat data
          const response = await fetch(`${process.env.BACKEND_URL}/api/add-cat`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: data,
          });
      
          const responseData = await response.json();
      
          if (response.status === 201) {
            return {
              success: true,
              message: "Cat added successfully",
              data: responseData.cat,
            };
          } else {
            return {
              success: false,
              message: responseData.error || "Failed to add cat",
            };
          }
        } catch (error) {
          console.error("Error posting cat data:", error);
          return {
            success: false,
            message: "An unexpected error occurred",
          };
        }
      },
      
  
      getCats: async () => {
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/cats`);
          console.log("Response status:", resp.status);
          console.log("Backend URL:", process.env.BACKEND_URL);
  
          if (!resp.ok) {
            const errorText = await resp.text();
            console.error("Error response text:", errorText);
            throw new Error(`Error: ${resp.status} ${resp.statusText}`);
          }
  
          const data = await resp.json();
          console.log("Fetched cats data:", data);
          setStore({ cats: data.cats });
          return { success: true };
        } catch (error) {
          console.error("Error fetching cats:", error);
          return { success: false, message: error.message };
        }
      },
      getSelfCats: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("No token found. User might not be logged in.");
            return { success: false, message: "Unauthorized access: No token provided." };
          }
      
          const response = await fetch(`${process.env.BACKEND_URL}/api/user-cats`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
      
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching user's cats:", errorData);
            return false
          }
      
         const responseBody = await response.json();
        console.log(responseBody)
          console.log("User's cats fetched successfully:", responseBody);
      
          setStore({ selfcats: responseBody });
      
          return true
        } catch (error) {
          console.error("Error occurred while fetching user's cats:", error);
          return { success: false, message: "An error occurred while fetching user's cats." };
        }
      },
      
      getCatById: async (catId) => {
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/cat/${catId}`);
          const data = await resp.json();
      
          if (resp.ok) {
            setStore({ singleCat: data.cat });  // Store the fetched cat in singleCat
          } else {
            console.error("Cat not found");
            setStore({ singleCat: null });  // In case the cat isn't found
          }
        } catch (error) {
          console.error("Error fetching single cat:", error);
          setStore({ singleCat: null });  // Handle error and set singleCat to null
        }
      },

      uploadProfilePic: async (file) => {
        try {
          const formData = new FormData();
          formData.append("file", file);
      
          // Use your backend route for image upload
          const response = await fetch(`${process.env.BACKEND_URL}/api/upload_profile_picture`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming the user is authenticated
            },
            body: formData,
          });
      
          if (!response.ok) {
            const error = await response.json();
            console.error("Error uploading profile picture:", error);
            return { success: false, message: error.error || "Failed to upload profile picture" };
          }
      
          const data = await response.json();
          console.log("Profile picture uploaded successfully:", data);
      
          // Update the user's profile picture in the store
          setStore({ user: { ...getStore().user, image_url: data.url } });
      
          return { success: true, message: "Profile picture updated successfully" };
        } catch (error) {
          console.error("Error during profile picture upload:", error);
          return { success: false, message: "An error occurred while uploading the profile picture" };
        }
      },
      
      deleteCat: async (catId) => {
        const token = localStorage.getItem("token");
  
        if (!token) {
          console.error("Token is missing. Please log in.");
          return { success: false, message: "User is not authenticated" };
        }
  
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/delete-cat/${catId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          });
  
          const data = await resp.json();
  
          if (resp.status === 403) {
            console.error("Unauthorized: You do not own this cat.");
            return { success: false, message: "You are not authorized to delete this cat." };
          }
  
          if (!resp.ok) {
            throw new Error(data.error || "Error dgetseleting cat");
          }
  
          // Update the store to remove the deleted cat
          const updatedCats = getStore().cats.filter((cat) => cat.id !== catId);
          setStore((prev) => ({
            ...prev,
            cats: updatedCats,
            message: "Cat deleted successfully!",
          }));
  
          return { success: true, message: "Cat deleted successfully" };
        } catch (error) {
          console.error("Error deleting cat:", error);
          return { success: false, message: error.message || "Error deleting cat" };
        }
      },

      // **Image Upload Actions**
      uploadImage: async (file) => {
        const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "cats"); // Uploads the image to the 'cats' folder
        console.log(file, "file");
        console.log(formData, "formData");
        
        try {
          const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
          });
    
          const data = await response.json();
          if (data.secure_url) {
            console.log("Uploaded image URL:", data.secure_url);
            return data.secure_url;
          } else {
            console.error("Upload error:", data.error.message);
            return null;
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          return null;
        }
      },
  
   
    

      // **Password Reset Actions**
      resetPassword: async (newPassword, token) => {
        const baseApiUrl = process.env.BACKEND_URL;
        if (!token) {
          console.error("Token is missing. Please provide a valid token.");
          return { success: false, message: "Token is required." };
        }

        try {
          const response = await fetch(`${baseApiUrl}/api/reset-password`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              new_password: newPassword,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            console.log("Password reset successfully.");
            return { success: true, message: "Password has been reset successfully." };
          } else {
            console.error("Error resetting password:", data.error || "Unknown error.");
            return { success: false, message: data.error || "Error resetting password." };
          }
        } catch (error) {
          console.error("Network error while resetting password:", error);
          return { success: false, message: "An error occurred while resetting the password." };
        }
      },

      getUserProfile: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("No token found");
            return null;
          }
      
          const BACKEND_URL = process.env.BACKEND_URL;
          console.log("Fetching user profile from:", `${BACKEND_URL}/api/user`);
      
          const response = await fetch(`${BACKEND_URL}/api/user`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
      
          const responseText = await response.text();
          console.log("Response Text:", responseText);
      
          if (!response.ok) {
            console.error(
              `Failed to fetch user profile: ${response.status} ${response.statusText}`
            );
            console.error("Error details:", responseText);
            return null;
          }
      
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error("Error parsing JSON response:", parseError);
            console.error("Response Text:", responseText); // Log the response again
            return null;
          }
      
          setStore({ user: data });
          console.log("Fetched user profile:", data);
          return data;
        } catch (error) {
          console.error("Error fetching user profile:", error);
          return null;
        }
      },
      
      
      
      requestPasswordReset: async (email) => {
        const baseApiUrl = process.env.BACKEND_URL;

        if (!email) {
          console.error("Email is required.");
          return { success: false, message: "Email is required." };
        }

        try {
          const response = await fetch(`${baseApiUrl}/api/request_reset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (response.ok) {
            console.log("Password reset link sent successfully.");
            return { success: true, message: "If your email is in our system, you will receive a password reset link." };
          } else {
            console.error("Error sending password reset link:", data.error || "Unknown error.");
            return { success: false, message: data.error || "Failed to send password reset link." };
          }
        } catch (error) {
          console.error("Network error while requesting password reset:", error);
          return { success: false, message: "An error occurred while sending the reset email." };
        }
      },
    },
  };
};

export default getState;
