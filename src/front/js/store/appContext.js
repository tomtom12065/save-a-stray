// appContext.js

import React, { useState, useEffect } from "react";
import getState from "./flux.js";

export const Context = React.createContext(null);

const injectContext = (PassedComponent) => {
  const StoreWrapper = (props) => {
    const [state, setState] = useState({
      store: null,
      actions: null,
    });

    useEffect(() => {
      const stateData = getState({
        getStore: () => state.store,
        getActions: () => state.actions,
        setStore: (updatedStore) =>
          setState((prevState) => ({
            store: { ...prevState.store, ...updatedStore },
            actions: { ...prevState.actions },
          })),
      });

      setState({
        store: stateData.store,
        actions: stateData.actions,
      });

      // Fetch initial data if necessary
      stateData.actions.getMessage();
    }, []);

    if (!state.store || !state.actions) return null;

    return (
      <Context.Provider value={state}>
        <PassedComponent {...props} />
      </Context.Provider>
    );
  };
  return StoreWrapper;
};

export default injectContext;
