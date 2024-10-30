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

      registerUser: async (userData) => {
        try {
          console.log(userData);
          const resp = await fetch(`${process.env.BACKEND_URL}/api/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });
          const data = await resp.json();
          
          if (!resp.ok) {
            return { success: false, message: data.error || "Error registering user" };
          }
          console.log(user);
          setStore({ user: data.user });
         
          return { success: true, message: "User registered successfully", status: 201 };

        }
         catch (error) {
          console.error("Error registering user", error);
          return { success: false, message: error.message };
        }
      },

      loginUser: async (userData) => {
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });
      
          const data = await resp.json();
      
          if (!resp.ok) {
            return { success: false, message: data.error || "Error logging in" };
          }
      
          setStore({ user: data.user, token: data.token });
          localStorage.setItem("token", data.token); // Persist token
          return { success: true, message: "Login successful" };
          
        } catch (error) {
          console.error("Error logging in", error);
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
