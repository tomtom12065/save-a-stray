let getState = ({ getStore, getActions, setStore }) => {
  //  getaction lets you use functions within the flux in other functions

  // Helper function to retrieve token
  let getToken = () => sessionStorage.getItem("token");
  console.log(getStore.token);

  return {
    store: {
      message: null,
      cats: [],
      user: JSON.parse(sessionStorage.getItem("user")) || null,
      selfcats: [],
      singleCat: [],
      token: sessionStorage.getItem("token") || null,
      isChatboxOpen: false,
      catApplications: [],
      currentChatRecipientId: null, // New field for chat context
      currentChatRecipientName: "",
      sentApplications: [],
      breeds: [],
    },

    actions: {
      //############################ session/STORE ACTIONS ############################
      setChatRecipient: (recipientId, recipientName) => {
        setStore({
          currentChatRecipientId: recipientId,
          currentChatRecipientName: recipientName,
        });
      },

      toggleChatboxOpen: (state) => {
        setStore({ isChatboxOpen: state });
      },

      logout: () => {
        console.log("Logging out...");
        sessionStorage.removeItem("token"); // Remove token from session
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("user");
        setStore({ user: null, token: null }); // Reset user and token in store
      },

      //############################ GET ACTIONS ############################
      getMessage: async () => {
        try {
          let resp = await fetch(`${process.env.BACKEND_URL}/api/hello`);
          let data = await resp.json();
          setStore({ message: data.message });
          return data;
        } catch (error) {
          console.error("Error loading message from backend", error);
        }
      },

      getBreeds: async () => {
        let response = await fetch("https://api.thecatapi.com/v1/breeds", {
          headers: {
            "x-api-key": process.env.CAT_API_KEY, // Securely retrieved API key
          },
        });

        if (response.ok) {
          let breedData = await response.json();
          let breedNames = breedData.map((breed) => breed.name);
          setStore({ breeds: breedNames });
          console.log("Breeds fetched successfully:", breedNames);
          return breedNames;
        } else {
          console.error("Error fetching cat breeds:", response.statusText);
          return null;
        }
      },

      fetchSentApplications: async () => {
        try {
          let token = sessionStorage.getItem("token"); // Get the token for authentication
          let response = await fetch(`${process.env.BACKEND_URL}/api/applications/sent`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Add the token to the request
            },
          });
          if (!response.ok) {
            throw new Error(`failed to fetch sent applications: ${response.statusText

              }`)
          }
          let data = await response.json();
          setStore({ sentApplications: data }); // Update store with fetched data
          return data
        } catch (error) {
          console.error("error fetching sent applications:", error)
          return null
        }

      },

      getMessages: async () => {
        try {
          let response = await fetch(`${process.env.BACKEND_URL}/api/get_messages`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }

          let messages = await response.json();
          setStore({ messages }); // Save messages to the store
          return messages;
        } catch (error) {
          console.error("Error fetching messages:", error);
          return null; // Return null on failure
        }
      },

      getConversationWithOwner: async (ownerId) => {
        let token = sessionStorage.getItem("token"); // Retrieve JWT token
        try {
          let response = await fetch(
            `${process.env.BACKEND_URL}/api/get_single_message?recipient_id=${ownerId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            let errorData = await response.json();
            console.error("Error fetching conversation:", errorData.error);
            throw new Error("Failed to fetch conversation");
          }

          let data = await response.json();
          setStore({ messages: data }); // Save the specific conversation in the global store
          return data; // Return the conversation for session use if needed
        } catch (error) {
          console.error("Fetch conversation failed:", error);
          return null; // Return null on failure
        }
      },
      // does this need to get the token.how does it get the toen
      getUserData: async (token) => {
        try {
          let response = await fetch(`${process.env.BACKEND_URL}/api/user`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            let error = await response.json();
            console.error("Failed to retrieve user data:", error);
            return { success: false, message: error.error || "User data retrieval failed" };
          }

          let data = await response.json();
          console.log("User data retrieved:", data);
          // Update the global state with user information
          setStore({ user: data });

          return { success: true };
        } catch (error) {
          console.error("Error fetching user data:", error);
          return { success: false, message: error.message };
        }
      },

      getCatApplications: async () => {
        try {
          let store = getStore();
          let token = store.token;

          if (!token) {
            console.error("Token is missing");
            throw new Error("Unauthorized: Token is required to fetch applications");
          }

          let url = `${process.env.BACKEND_URL}/api/get-applications`;
          console.log("Fetching applications from:", url);

          let response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            let errorData = await response.json();
            console.error("Error response from server:", errorData);
            throw new Error(`Failed to fetch applications: ${response.statusText}`);
          }

          let data = await response.json();
          console.log("Applications fetched successfully:", data);

          setStore({
            catApplications: data,
          });

          return data; // Return the fetched applications
        } catch (error) {
          console.error("Error fetching cat applications:", error.message || error);
          return null; // Return null on failure
        }
      },

      getCats: async () => {
        try {
          let resp = await fetch(`${process.env.BACKEND_URL}/api/cats`);
          console.log("Response status:", resp.status);
          console.log("Backend URL:", process.env.BACKEND_URL);

          if (!resp.ok) {
            let errorText = await resp.text();
            console.error("Error response text:", errorText);
            throw new Error(`Error: ${resp.status} ${resp.statusText}`);
          }

          let data = await resp.json();
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
          let token = sessionStorage.getItem("token");
          if (!token) {
            console.error("No token found. User might not be logged in.");
            return { success: false, message: "Unauthorized access: No token provided." };
          }

          let response = await fetch(`${process.env.BACKEND_URL}/api/user-cats`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            let errorData = await response.json();
            console.error("Error fetching user's cats:", errorData);
            return false;
          }

          let responseBody = await response.json();
          console.log(responseBody);
          console.log("User's cats fetched successfully:", responseBody);

          setStore({ selfcats: responseBody });

          return true;
        } catch (error) {
          console.error("Error occurred while fetching user's cats:", error);
          return { success: false, message: "An error occurred while fetching user's cats." };
        }
      },

      getCatById: async (catId) => {
        try {
          let resp = await fetch(`${process.env.BACKEND_URL}/api/cat/${catId}`);
          let data = await resp.json();

          if (resp.ok) {
            setStore({ singleCat: data.cat }); // Store the fetched cat in singleCat
          } else {
            console.error("Cat not found");
            setStore({ singleCat: null }); // In case the cat isn't found
          }
        } catch (error) {
          console.error("Error fetching single cat:", error);
          setStore({ singleCat: null }); // Handle error and set singleCat to null
        }
      },

      getUserProfile: async () => {
        let token = sessionStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          return null;
        }

        let BACKEND_URL = process.env.BACKEND_URL;
        console.log("Fetching user profile from:", `${BACKEND_URL}/api/user`);

        try {
          let response = await fetch(`${BACKEND_URL}/api/user`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response);

          if (!response.ok) {
            let errorData = await response.json();
            console.error("Error fetching user profile:", errorData);
            throw new Error(errorData.error || "Failed to fetch user profile");
          }

          let data = await response.json();
          console.log("getUserProfile data", data);
          return data;
        } catch (error) {
          console.error("Error in getUserProfile:", error);
          throw error;
        }
      },

      //############################ POST ACTIONS ############################
      markMessagesAsRead: async (senderId, recipientId) => {
        try {
          let response = await fetch(`${process.env.BACKEND_URL}/api/mark_as_read`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({ sender_id: senderId, recipient_id: recipientId }),
          });

          if (!response.ok) {
            throw new Error("Failed to mark messages as read.");
          }

          console.log("Messages marked as read.");
          let data = await response.json();
          return data.updated_count; // Number of messages marked as read
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      },

      createConversation: async (recipientId) => {
        try {
          let response = await fetch(`${process.env.BACKEND_URL}/api/create_conversation`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({ recipient_id: recipientId }),
          });

          if (!response.ok) {
            let errorData = await response.json();
            throw new Error(errorData.error || "Failed to create conversation");
          }

          let result = await response.json();
          console.log("Conversation created:", result.message);
          return true; // Indicate success
        } catch (error) {
          console.error("Error creating conversation:", error);
          return false; // Indicate failure
        }
      },

      sendConfirmationEmail: async (applicationId) => {
        let token = sessionStorage.getItem("token"); // Retrieve JWT token
        if (!token) {
          console.error("No token found. User not authenticated.");
          return { success: false, message: "User not authenticated." };
        }

        try {
          let response = await fetch(`${process.env.BACKEND_URL}/api/send-confirmation-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ application_id: applicationId }),
          });

          let data = await response.json();

          if (!response.ok) {
            console.error("Error sending confirmation email:", data.error);
            return {
              success: false,
              message: data.error || "Failed to send confirmation email.",
            };
          }

          console.log("Confirmation email sent successfully:", data.message);
          return { success: true, message: data.message };
        } catch (error) {
          console.error("Error during confirmation email request:", error);
          return {
            success: false,
            message: "An error occurred while sending the confirmation email.",
          };
        }
      },

      sendMessage: async (recipientId, text) => {
        try {
          let payload = {
            recipient_id: recipientId,
            text: text,
          };
          console.log("Sending payload:", payload);

          let response = await fetch(`${process.env.BACKEND_URL}/api/send_message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
          });

          console.log("Response status:", response.status);

          if (!response.ok) {
            let errorData = await response.json();
            console.error("Backend Error:", errorData);
            throw new Error("Failed to send message");
          }

          let result = await response.json();
          console.log("Message sent successfully:", result);
          return result;
        } catch (error) {
          console.error("Error sending message:", error);
          return null;
        }
      },

      registerUser: async (userData) => {
        try {
          console.log("Starting registration process in register_user.");
          let url = `${process.env.BACKEND_URL}/api/register`;

          let resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });

          let data = await resp.json();
          if (!resp.ok) {
            return {
              success: false,
              message: data.error || "Error registering user",
            };
          }

          // data will now contain "user", "access_token", and "refresh_token"
          if (data && data.user) {
            // Store user and tokens in sessionStorage
            sessionStorage.setItem("token", data.access_token);
            sessionStorage.setItem("refresh_token", data.refresh_token);
            sessionStorage.setItem("user", JSON.stringify(data.user));

            // Update your store
            setStore({
              user: data.user,
              token: data.access_token,
            });

            // Optionally call getMessages or anything else
            let actions = getActions();
            actions.getMessages(data.user.id);

            return {
              success: true,
              message: "User registered and logged in successfully",
              status: 201,
            };
          } else {
            return { success: false, message: "No user data received from server" };
          }
        } catch (error) {
          console.error("Error occurred during registration process:", error);
          return { success: false, message: error.message };
        }
      },

      submitApplication: async (applicationData) => {
        let token = sessionStorage.getItem("token"); // Assumes the JWT token is stored in the store

        let response = await fetch(`${process.env.BACKEND_URL}/api/applications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Attach token for authentication
          },
          body: JSON.stringify(applicationData), // Convert application data to JSON
        });

        if (response.ok) {
          let data = await response.json();
          console.log("Application submitted successfully:", data);
          return true; // Success
        }

        let errorData = await response.json();
        console.error("Error submitting application:", errorData);
        return false; // Failure
      },

      // There are two loginUser functions in this code. Below is the second one.
      loginUser: async (userData) => {
        console.log("loginUser called with userData:", userData);

        try {
          let backendUrl = process.env.BACKEND_URL;
          console.log("Backend URL:", backendUrl);

          let endpoint = `${backendUrl}/api/login`;
          console.log("Login endpoint:", endpoint);

          let requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          };
          console.log("Request options:", requestOptions);

          let resp = await fetch(endpoint, requestOptions);
          console.log("Fetch response received:", resp);

          let data = await resp.json();
          console.log("Response JSON data:", data);

          console.log("Response status OK?", resp.ok);

          if (resp.status === 401) {
            let errorMessage = data.error || "Error logging in";
            console.error("Login failed:", errorMessage);
            return { success: false, message: errorMessage };
          }

          console.log("Login successful. Data received:", data);
          console.log("Store updated with user and token:", {
            user: data.user,
            token: data.access_token,
          });

          // Save the tokens to sessionStorage
          sessionStorage.setItem("token", data.access_token);
          sessionStorage.setItem("refresh_token", data.refresh_token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
          setStore({ user: data.user, token: data.access_token });

          let actions = getActions();
          actions.getMessages(data.user.id);
          console.log("Tokens saved to sessionStorage:", data.access_token, data.refresh_token);

          return { success: true, message: "Login successful" };
        } catch (error) {
          console.error("An error occurred during login:", error);
          return { success: false, message: error.message };
        }
      },

      postCatData2: async (catFormData) => {
        try {
          let token = sessionStorage.getItem("token");
          if (!token) {
            return { success: false, message: "User is not authenticated" };
          }

          // Retrieve all files from FormData under the "image" key
          let images = catFormData.getAll("image");

          // 1) Call the flexible uploadImage, which handles either one or many
          let uploadedUrls = await getActions().uploadImage(images);

          if (!uploadedUrls || uploadedUrls.length === 0) {
            return { success: false, message: "No image URLs returned. Please try again." };
          }

          // 2) Prepare the cat data for the API request
          let data = JSON.stringify({
            name: catFormData.get("name"),
            breed: catFormData.get("breed"),
            age: catFormData.get("age"),
            price: catFormData.get("price"),
            image_urls: uploadedUrls, // array of image URLs
            description: catFormData.get("description"),
          });

          let response = await fetch(`${process.env.BACKEND_URL}/api/add-cat`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: data,
          });

          let responseData = await response.json();

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

      uploadProfilePic: async (file) => {
        try {
          let formData = new FormData();
          formData.append("file", file);

          // Use your backend route for image upload
          let response = await fetch(`${process.env.BACKEND_URL}/api/upload_profile_picture`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Assuming the user is authenticated
            },
            body: formData,
          });

          if (!response.ok) {
            let error = await response.json();
            console.error("Error uploading profile picture:", error);
            return { success: false, message: error.error || "Failed to upload profile picture" };
          }

          let data = await response.json();
          console.log("Profile picture uploaded successfully:", data);

          // Update the user's profile picture in the store
          setStore({ user: { ...getStore().user, profilepic: data.url } });

          return { success: true, message: "Profile picture updated successfully" };
        } catch (error) {
          console.error("Error during profile picture upload:", error);
          return {
            success: false,
            message: "An error occurred while uploading the profile picture",
          };
        }
      },

      uploadImage: async (input) => {
        // Convert any single file input into an array for uniform processing
        const files = Array.isArray(input) ? input : [input];

        let uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
        let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        let uploadedUrls = [];

        // Upload each file individually
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", uploadPreset);
          formData.append("folder", "cats"); // optional folder on Cloudinary

          try {
            let response = await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              {
                method: "POST",
                body: formData,
              }
            );

            let data = await response.json();

            if (data.secure_url) {
              uploadedUrls.push(data.secure_url);
            } else {
              console.error("Upload error:", data.error?.message);
              // You could throw an error here, or return null
              return null;
            }
          } catch (error) {
            console.error("Error uploading image:", error);
            return null;
          }
        }

        // Return an array of secure URLs
        return uploadedUrls;
      },

      requestPasswordReset: async (email) => {
        let baseApiUrl = process.env.BACKEND_URL;

        if (!email) {
          console.error("Email is required.");
          return { success: false, message: "Email is required." };
        }

        try {
          let response = await fetch(`${baseApiUrl}/api/request_reset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          let data = await response.json();

          if (response.ok) {
            console.log("Password reset link sent successfully.");
            return {
              success: true,
              message:
                "If your email is in our system, you will receive a password reset link.",
            };
          } else {
            console.error("Error sending password reset link:", data.error || "Unknown error.");
            return { success: false, message: data.error || "Failed to send password reset link." };
          }
        } catch (error) {
          console.error("Network error while requesting password reset:", error);
          return { success: false, message: "An error occurred while sending the reset email." };
        }
      },

      //############################ PUT ACTIONS ############################
      updateUser: async (userInfo) => {
        try {
          let response = await fetch(`${process.env.BACKEND_URL}/api/update_user`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify(userInfo),
          });

          if (!response.ok) {
            let errorData = await response.json();
            throw new Error(errorData.error || "Failed to update user");
          }

          let updatedUser = await response.json();
          setStore({ user: updatedUser.user }); // Update user in the store
          return true; // Indicate success
        } catch (error) {
          console.error("Error updating user:", error);
          return false; // Indicate failure
        }
      },
      // the problem is with the send email confirmation 
      updateApplicationStatus: async (applicationId, newStatus) => {

        let token = sessionStorage.getItem("token");

        if (!token) {
          console.error("No token found, user not authenticated");
          return { success: false, message: "Not authenticated" };
        }

        try {
          let response = await fetch(
            `${process.env.BACKEND_URL}/api/applications/${applicationId}/status`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: newStatus }),
            }
          );

          let data = await response.json();
          if (!response.ok) {
            console.error("Error updating application status:", data.error);
            return { success: false, message: data.error || "Failed to update status" };
          }

          // Refresh applications after updating
          let actions = getActions();
          await actions.getCatApplications();

          // Send confirmation email if status is approved
          if (newStatus === "approved") {
            let emailResponse = await actions.sendConfirmationEmail(applicationId);
            if (!emailResponse.success) {
              console.error("Error sending confirmation email:", emailResponse.message);
              return { success: false, message: emailResponse.message };
            }
          }

          return { success: true, message: "Status updated successfully" };
        } catch (error) {
          console.error("Exception while updating application status:", error);
          return { success: false, message: error.message };
        }
      },

      // In your actions object
      editCat: async (catId, updatedData) => {
        const token = sessionStorage.getItem("token");;
        
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/api/edit_cat/${catId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token},
            body: JSON.stringify(updatedData)
            
          });
          const data = await response.json();
          if (response.ok) {
            return { success: true, cat: data.cat };
          } else {
            return { success: false, message: data.message || "Failed to update cat" };
          }
        } catch (error) {
          console.error("Error updating cat:", error);
          return { success: false, message: "An error occurred." };
        }
      },


      resetPassword: async (newPassword, token) => {
        let baseApiUrl = process.env.BACKEND_URL;
        if (!token) {
          console.error("Token is missing. Please provide a valid token.");
          return { success: false, message: "Token is required." };
        }

        try {
          let response = await fetch(`${baseApiUrl}/api/reset-password`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              new_password: newPassword,
            }),
          });

          let data = await response.json();

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

      //############################ DELETE ACTIONS ############################
      deleteCat: async (catId) => {
        let token = sessionStorage.getItem("token");

        if (!token) {
          console.error("Token is missing. Please log in.");
          return { success: false, message: "User is not authenticated" };
        }

        try {
          let resp = await fetch(`${process.env.BACKEND_URL}/api/delete-cat/${catId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          let data = await resp.json();

          if (resp.status === 403) {
            console.error("Unauthorized: You do not own this cat.");
            return { success: false, message: "You are not authorized to delete this cat." };
          }

          if (!resp.ok) {
            throw new Error(data.error || "Error deleting cat");
          }

          // Update the store to remove the deleted cat
          let updatedCats = getStore().cats.filter((cat) => cat.id !== catId);
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
    },
  };
};

export default getState;
