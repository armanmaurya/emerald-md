import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LayoutProvider } from "./context/LayoutContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <LayoutProvider>
        <App />
      </LayoutProvider>
    </ThemeProvider>
  </React.StrictMode>
);
