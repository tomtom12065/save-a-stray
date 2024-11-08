const getState = ({ getStore, setStore }) => {
  // Helper function to retrieve token
  const getToken = () => localStorage.getItem("token");
  console.log(getStore.token)
  return {
    store: {
      message: null,
      cats: [],
      user: null,
      token: localStorage.getItem("token")
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

      register_user: async (userData) => {
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

          // Assuming setStore is a state management function
          setStore({ user: data.user, token: data.token });
          console.log("Store updated with user and token:", { user: data.user, token: data.token });

          localStorage.setItem("token", data.token);
          // potentially also adding user to local storage if so then have to clear it out when logging out
          console.log("Token saved to localStorage:", data.token);

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
            "Authorization": "Bearer " + localStorage.getItem("token"),
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
            data: responseData.cat
          };
        } else {
          return {
            success: false,
            message: responseData.error || "Failed to add cat"
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
          const token = localStorage.getItem("token");
          if (!token) {
            return { success: false, message: "User is not authenticated" };
          }

          const data = JSON.stringify({
            name: cat.name,
            breed: cat.breed,
            age: cat.age,
            price: cat.price
          });

          const response = await fetch(`${process.env.BACKEND_URL}/api/add-cat`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: data
          });

          const responseData = await response.json();

          if (response.status === 201) {
            return {
              success: true,
              message: "Cat added successfully",
              data: responseData.cat
            };
          } else {
            return {
              success: false,
              message: responseData.error || "Failed to add cat"
            };
          }
        } catch (error) {
          console.error("Error posting cat data:", error);
          return {
            success: false,
            message: "An unexpected error occurred"
          };
        }
      },

      getCats: async () => {
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/cats`);
          const data = await resp.json();

          if (!resp.ok) {
            throw new Error(data.error || "Error fetching cats");
          }

          setStore({ cats: data.cats });
        } catch (error) {
          console.error("Error fetching cats", error);
        }
      }, 
      // grab info from local strorage use jwwt manager to get token 
      getCats2: async () => {
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/cats`);
          const data = await resp.json();

          if (!resp.ok) {
            throw new Error(data.error || "Error fetching cats");
          }

          setStore({ cats: data.cats });
        } catch (error) {
          console.error("Error fetching cats", error);
        }
      },

      // make a conditional
      deleteCat: async (catId) => {
      //  user.getToken()?
        const token = getToken();

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

          if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.error || "Error deleting cat");
          }

          // Update the store to remove the deleted cat
          const updatedCats = getStore().cats.filter((cat) => cat.id !== catId);
          console.log("Updated cats after deletion:", updatedCats);

          setStore((prev) => ({
            ...prev,
            cats: updatedCats,
            message: "Cat deleted successfully!",
          }));

          // Return success response
          return { success: true, message: "Cat deleted successfully" };

        } catch (error) {
          console.error("Error deleting cat:", error);
          return { success: false, message: error.message || "Error deleting cat" };
        }
      },
      logout: () => {
        console.log("Logging out...");
        localStorage.removeItem("token"); // Remove token from localStorage
        setStore({ user: null, token: null }); // Reset user and token in store
      },
      getUserCats: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing. Please log in.");
          return { success: false, message: "User is not authenticated" };
        }
      
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/user-cats`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
      
          const data = await resp.json();
          if (!resp.ok) {
            throw new Error(data.error || "Error fetching user cats");
          }
      
          setStore({ cats: data.cats });
          return { success: true };
        } catch (error) {
          console.error("Error fetching user cats:", error);
          return { success: false, message: error.message };
        }
      },
    },
  };
};

export default getState;
