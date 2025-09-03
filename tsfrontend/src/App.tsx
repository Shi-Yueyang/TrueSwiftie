import GamePage from "./pages/GamePage";
import { Route, Routes, useLocation } from "react-router-dom";
import GameOver from "./pages/GameOver";
import StartGame from "./pages/StartGame";
import TopPlayers from "./pages/TopPlayers";
import { Stack } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContex";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./styles/App.css";
import GameHistoryList from "./components/GameHistoryList";
import ProtectedRoute from "./components/ProtectedRoute ";
import EditUserInfo from "./pages/EditUserInfo";

// animations
// import { useContext } from "react";
// import { AppContext } from "./context/AppContext";
// import Snowfall from "react-snowfall";

function App() {
  // const {  snowfallProps } = useContext(AppContext);
  const { userId } = useContext(AuthContext);
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login";
  const isGameRoute = location.pathname === "/game";

  return (
    <>
      {/* <Snowfall {...snowfallProps} /> */}

      <Stack
        direction={"column"}
        sx={{ ml: userId && !isAuthRoute && !isGameRoute ? { md: "260px" } : 0 }}
      >
        {userId && !isAuthRoute && !isGameRoute ? <NavBar /> : null}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <StartGame />
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
                <GameHistoryList />
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
        </Routes>
      </Stack>
    </>
  );
}
export default App;
