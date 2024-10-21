import React, { useState, useEffect } from "react";
import getState from "./flux.js";

// Initialize context with a default value of null
export const Context = React.createContext(null);

// Function to inject the global store into components
const injectContext = PassedComponent => {
    const StoreWrapper = props => {
        const [state, setState] = useState(
            getState({
                getStore: () => state.store,
                getActions: () => state.actions,
                setStore: updatedStore =>
                    setState({
                        store: { ...state.store, ...updatedStore },
                        actions: { ...state.actions },
                    }),
            })
        );

        useEffect(() => {
            // Fetch initial message from the backend when the app loads
            state.actions.getMessage();
        }, []);

        return (
            <Context.Provider value={state}>
                <PassedComponent {...props} />
            </Context.Provider>
        );
    };
    return StoreWrapper;
};

export default injectContext;
