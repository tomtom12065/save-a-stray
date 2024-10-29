const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      message: null,
      cats: [], // Holds the list of cats with their owner information
      user: null, // Holds logged-in or registered user data
      token: null, // Holds token for authenticated requests
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
          console.log("Attempting to register user", userData);

          const resp = await fetch(`${process.env.BACKEND_URL}/api/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: userData.email,
              password: userData.password
            }),
          });

          const data = await resp.json();
          if (!resp.ok) {
            return { success: false, message: data.error || "Error registering user" };
          }

          setStore({ user: data.user });
          return { success: true, message: "User registered successfully", status: 201 };

        } catch (error) {
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
            body: JSON.stringify({
              email: userData.email,
              password: userData.password
            }),
          });
      
          const data = await resp.json();
      
          if (!resp.ok) {
            return { success: false, message: data.error || "Error logging in" };
          }
      
          setStore({ user: data.user, token: data.token });
          localStorage.setItem("token", data.token); // Save token for persistence
          console.log("Token saved to localStorage:", localStorage.getItem("token"));
          return { success: true, message: "Login successful" };
          
      
        } catch (error) {
          console.error("Error logging in", error);
          return { success: false, message: error.message };
        }
      },
      

      postCatData: async (cat) => {
        const store = getStore();
        const token = store.token || localStorage.getItem("token"); // Check if token exists in store or localStorage
        
        if (!token) {
          console.error("Token is missing. Please log in.");
          return { success: false, message: "User is not authenticated" };
        }
      
        console.log("Token used for posting cat data:", token);
      
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/add-cat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` // Pass token in header
            },
            body: JSON.stringify({
              name: cat.name,
              breed: cat.breed,
              price: cat.price,
              age: cat.age,
            }),
          });
      
          const data = await resp.json();
      
          if (!resp.ok) {
            throw new Error(data.error || "Error posting cat data");
          }
      
          // Ensure `data.cat` exists before adding it to the store
          if (data.cat) {
            setStore({ cats: [...store.cats, data.cat], message: "Cat added!" });
          }
      
          return { status: resp.status, data: data };
        } catch (error) {
          console.error("Error posting cat data", error);
          return { status: 500, error: error.message };
        }
      }
      ,
      

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
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/delete-cat/${catId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${getStore().token}`
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
