// index.js

import React from "react";
import ReactDOM from "react-dom";
import injectContext from "./store/appContext"; // Import injectContext
import "../styles/index.css";
import Layout from "./layout";

// Wrap Layout with injectContext
const App = injectContext(Layout);

ReactDOM.render(<App />, document.querySelector("#app"));
