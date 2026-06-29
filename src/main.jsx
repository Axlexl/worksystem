import React from "react";
import ReactDOM from "react-dom/client";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import "./index.css";
import App from "./App";
import { ThemeContextProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

dayjs.extend(isSameOrAfter);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeContextProvider>
  </React.StrictMode>
);
