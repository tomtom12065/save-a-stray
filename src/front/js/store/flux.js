const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            message: null,
            // Initialize with an empty array for cats
            cats: [],
        },
        actions: {
            // Example function that changes color (for demo purposes)
            exampleFunction: () => {
                getActions().changeColor(0, "green");
            },

            // Fetch a message from the backend
            getMessage: async () => {
                try {
                    const resp = await fetch(`${process.env.BACKEND_URL}/api/hello`);
                    const data = await resp.json();
                    setStore({ message: data.message });
                    return data; // Resolve the async function
                } catch (error) {
                    console.error("Error loading message from backend", error);
                }
            },

            // Post cat data from the upload form
            postCatData: async (cat) => {
                try {
                    const resp = await fetch(`${process.env.BACKEND_URL}/api/add-cat`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(cat),
                    });

                    if (!resp.ok) {
                        throw new Error("Error posting cat data");
                    }

                    const data = await resp.json();
                    console.log("Cat added:", data);

                    // Update the store after posting
                    const store = getStore();
                    setStore({ ...store, message: "Cat added!", cats: [...store.cats, data.cat] });

                    return data;
                } catch (error) {
                    console.error("Error posting cat data", error);
                }
            },

            // Change color function (for demo purposes)
            changeColor: (index, color) => {
                const store = getStore();

                // Loop through the demo array to change the background color at the specified index
                const demo = store.demo.map((elm, i) => {
                    if (i === index) elm.background = color;
                    return elm;
                });

                // Update the global store
                setStore({ demo: demo });
            },
        },
    };
};

export default getState;
