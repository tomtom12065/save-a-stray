const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      message: null,
      cats: [], // Holds the list of cats with their owner information
    },
    actions: {
      // Fetch a welcome message from the backend
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

      // POST a new cat to the backend
      postCatData: async (cat) => {
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/add-cat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: cat.name,
              breed: cat.breed,
              price: cat.price,
              age: cat.age,
              // user_id: cat.user_id, // Added user_id to associate the cat with a user
            }),
          });

          const data = await resp.json();

          if (!resp.ok) {
            throw new Error(data.error || "Error posting cat data");
          }

          // Add the newly created cat to the cats list in the store
          setStore({ cats: [...getStore().cats, data.cat], message: "Cat added!" });

          return { status: resp.status, data: data };
        } catch (error) {
          console.error("Error posting cat data", error);
          return { status: 500, error: error.message };
        }
      },

      // GET all cats, including their owner information
      getCats: async () => {
        try {
          const resp = await fetch(`${process.env.BACKEND_URL}/api/cats`);
          const data = await resp.json();

          if (!resp.ok) {
            throw new Error(data.error || "Error fetching cats");
          }

          // Update the cats array in the store with data from the backend
          setStore({ cats: data.cats });
        } catch (error) {
          console.error("Error fetching cats", error);
        }
      },
    },
  };
};

export default getState;
