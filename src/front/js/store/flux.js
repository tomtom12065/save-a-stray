const getState = ({ getStore, setStore }) => {
  // Helper function to retrieve token
  const getToken = () => getStore().token || localStorage.getItem("token");

  return {
    store: {
      message: null,
      cats: [], 
      user: null, 
      token: null, 
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
    
        if (response.status !== 201) return false;
        const responseBody = await response.json();
        console.log(responseBody);
        return true;
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

      deleteCat: async (catId) => {
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

          const updatedCats = getStore().cats.filter((cat) => cat.id !== catId);
          setStore({ cats: updatedCats, message: "Cat deleted!" });
        } catch (error) {
          console.error("Error deleting cat", error);
        }
      },
    },
  };
};

export default getState;
