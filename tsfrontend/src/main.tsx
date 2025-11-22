import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext.tsx";
import { springTheme } from "./themes/christmasTheme";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContex.tsx";
import { WsProvider } from "./context/WsContext.tsx";
import { BrowserRouter as Router } from "react-router-dom";
// import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={springTheme}>
      <AuthProvider>
        <AppProvider>
          <WsProvider>
            <Router>
            {/* <GoogleOAuthProvider clientId="1056981657468-vaaeorfqols8sd5lq20233773a0jd9cq.apps.googleusercontent.com"> */}
              <App />
            {/* </GoogleOAuthProvider> */}
            </Router>
          </WsProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
