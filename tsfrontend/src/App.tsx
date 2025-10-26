import GamePage from "./pages/GamePage";
import { Route, Routes, useLocation } from "react-router-dom";
import GameOver from "./pages/GameOver";
import HomePage from "./pages/HomePage";
import TopPlayers from "./pages/TopPlayers";
import { Box, Stack } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContex";
import SideBar from "./components/SideBar";
import BottomBar from "./components/BottomBar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./styles/App.css";
import GameHistoryPage from "./pages/GameHistoryPage";
import ProtectedRoute from "./components/ProtectedRoute ";
import EditUserInfo from "./pages/EditUserInfo";
import UserProfile from "./pages/UserProfile";
import Support from "./pages/Support";
import GameLobby from "./pages/GameLobby";

// animations
// import { useContext } from "react";
// import { AppContext } from "./context/AppContext";
// import Snowfall from "react-snowfall";

function App() {
  // const {  snowfallProps } = useContext(AppContext);
  const { userId } = useContext(AuthContext);
  const location = useLocation();
  const isHomeRoute = location.pathname === "/";
  const isProfileRoute = location.pathname === "/profile";
  return (
    <>
      {/* <Snowfall {...snowfallProps} /> */}

      <Stack
        direction={"column"}
        sx={{
          // Only reserve left space when the desktop sidebar is actually shown
          ml:
            userId && (isHomeRoute || isProfileRoute)
              ? { md: "260px" }
              : 0,
        }}
      >
        {userId && (isHomeRoute || isProfileRoute) ? (
          <>
            {/* Desktop Sidebar */}
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <SideBar />
            </Box>
            {/* Mobile Bottom Bar */}
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <BottomBar />
            </Box>
          </>
        ) : null}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <GameLobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-over"
            element={
              <ProtectedRoute>
                <GameOver />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/game-history"
            element={
              <ProtectedRoute>
                <GameHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-user-info"
            element={
              <ProtectedRoute>
                <EditUserInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/top-players"
            element={
              <ProtectedRoute>
                <TopPlayers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Stack>
    </>
  );
}
export default App;
