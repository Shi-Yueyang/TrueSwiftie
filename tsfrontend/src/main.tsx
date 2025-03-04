import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext.tsx";
import christmasTheme from "./themes/christmasTheme";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContex.tsx";
import { BrowserRouter as Router } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={christmasTheme}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <App />
          </Router>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
