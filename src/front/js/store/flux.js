const getState = ({ getStore, setStore }) => {
  // Helper function to retrieve token
  const getToken = () => sessionStorage.getItem("token");
  console.log(getStore.token)
  return {
    store: {
      message: null,
      cats: [],
      user: null,
      token: sessionStorage.getItem("token")
    },
    actions: {
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

      registerUser: async (userData) => {
        try {
          console.log("Starting registration process in register_user.");

          console.log("Registering user - Input Data:", userData);
          console.log("Type of userData:", typeof userData); // Should be "object"

          const url = `${process.env.BACKEND_URL}/api/register`;
          console.log("URL for registration:", url);

          // Convert user data to JSON string
          const bodyData = JSON.stringify(userData);
          console.log("Data to be sent in body (JSON string):", bodyData);
          console.log("Type of bodyData:", typeof bodyData); // Should be "string"

          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: bodyData,
          });

          // Check if response was received and log status
          console.log("Fetch response received. Status:", resp.status);
          if (!resp.ok) {
            console.log("Fetch request failed. Response status:", resp.status);
            const errorData = await resp.json();
            console.log("Error data received from server:", errorData);
            return { success: false, message: errorData.error || "Error registering user" };
          }

          const data = await resp.json();
          console.log("Data parsed from JSON response:", data);
          console.log("Type of data:", typeof data); // Should be "object"

          // Checks that user data is present in the response
          if (data && data.user) {
            console.log("User registered successfully:", data.user);
            setStore({ user: data.user });
            return { success: true, message: "User registered successfully", status: 201 };
          } else {
            console.log("No user data received in response.");
            return { success: false, message: "No user data received from server" };
          }
        } catch (error) {
          console.error("Error occurred during registration process:", error);
          return { success: false, message: error.message };
        }
      }
      ,


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

          // Update the store with the user data and tokens
          setStore({ user: data.user, token: data.access_token });
          console.log("Store updated with user and token:", { user: data.user, token: data.access_token });

          // Save the tokens to sessionStorage
          sessionStorage.setItem("token", data.access_token);
          sessionStorage.setItem("refresh_token", data.refresh_token);
          console.log("Tokens saved to sessionStorage:", data.access_token, data.refresh_token);

          return { success: true, message: "Login successful" };
        } catch (error) {
          console.error("An error occurred during login:", error);
          return { success: false, message: error.message };
        }
      },



      postCatData: async (cat) => {
        const data = JSON.stringify({ name: cat.name, breed: cat.breed, age: cat.age, price: cat.price });

        const response = await fetch(`${process.env.BACKEND_URL}/api/add-cat`, {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("token"),
            "Content-Type": "application/json"
          },
          body: data
        });

        // if (response.status !== 201) return false;
        // const responseBody = await response.json();
        // console.log(responseBody);
        // return true;

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
        // look into getting this catch back into the code
        // } catch(error) {
        //   console.error("Error posting cat data:", error);
        //   return {
        //     success: false,
        //     message: "An unexpected error occurred"
        //   };
        // }
      },
      //   const token = getToken();
      //   if (!token) {
      //     console.error("Token is missing. Please log in.");
      //     return { success: false, message: "User is not authenticated" };
      //   }

      //   console.log("Token used for posting cat data:", token);

      //   try {
      //     const resp = await fetch(`${process.env.BACKEND_URL}/api/add-cat`, {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       //  can use userid to make more better readable lines of code
      //         "Authorization": `Bearer ${token}` 
      //       },
      //       body: JSON.stringify(cat),
      //     });

      //     const data = await resp.json();

      //     if (!resp.ok) {
      //       throw new Error(data.error || "Error posting cat data");
      //     }

      //     if (data.cat) {
      //       setStore({ cats: [...getStore().cats, data.cat], message: "Cat added!" });
      //     } else {
      //       throw new Error("Invalid cat data received");
      //     }

      //     return { status: resp.status, data: data };
      //   } catch (error) {
      //     console.error("Error posting cat data", error);
      //     return { status: 500, error: error.message };
      //   }
      // },

      //postCatData redone:
      postCatData2: async (cat) => {
        try {
          const token = sessionStorage.getItem("token");
          if (!token) {
            return { success: false, message: "User is not authenticated" };
          }
      
          // Step 1: Upload the image to Cloudinary
          const imageUrl = await uploadImage(cat.imageFile);
          if (!imageUrl) {
            return { success: false, message: "Image upload failed. Please try again." };
          }
      
          // Step 2: Prepare the cat data with the uploaded image URL
          const data = JSON.stringify({
            name: cat.name,
            breed: cat.breed,
            age: cat.age,
            price: cat.price,
            imageUrl: imageUrl, // Include the image URL from Cloudinary
          });
      
          // Step 3: Make the API request to add the cat data
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
          // console.error("Error fetching cats:", error);
          return { success: false, message: error.message };
        }
      },


      // make a conditional
      deleteCat: async (catId) => {
        const token = sessionStorage.getItem("token");

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
            throw new Error(data.error || "Error deleting cat");
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

      logout: () => {
        console.log("Logging out...");
        sessionStorage.removeItem("token"); // Remove token from sessionStorage
        setStore({ user: null, token: null }); // Reset user and token in store
      },
      getSelfCats: async () => {
        const response = await fetch(process.env.BACKEND_URL + "/api/user-cats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem("token"),
          },
        });

        if (response.status !== 200) return false;

        const responseBody = await response.json();
        setStore({ cats: responseBody }); // Fixed casing on `responseBody`

        return true;
      },

     


      resetPassword: async (newPassword, token) => {
        //  put at top so everyone can access
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
