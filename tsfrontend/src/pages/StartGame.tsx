import { useContext, useEffect } from "react";
import { Typography, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import "@fontsource/poppins";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { fetchGameTurn, startGameSession } from "../services/api";
import { AuthContext } from "../context/AuthContex";
import { useNavigate } from "react-router-dom";
import { fetchCsrfToken } from "../services/api";
const StartGame = () => {
  const navigate = useNavigate();
  const {
    setStartTime,
    gameSession,
    setGameSession,
    setCurrentTurn,
    sound,
    setSound,
    setSong,
  } = useContext(AppContext);

  const { userName } = useContext(AuthContext);

  // All users are treated as normal users; no guest mode

  if (sound) {
    if (sound) {
      sound.fade(1, 0, 1000);
      setTimeout(() => {
        sound.stop();
        sound.unload();
      }, 1000);
    }
    setSound(null);
  }

  // Guest login removed; this page requires authentication

  const handleStartGame = async () => {
    if (userName) {
      setStartTime(new Date()); // still track locally if needed
      try {
        // create CSRF token

        const csrfToken = await fetchCsrfToken();
        axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
        const session = await startGameSession();
        setGameSession(session);
        const turn = await fetchGameTurn(session.current_turn);
        setCurrentTurn(turn);
        navigate("/game");
        console.log("Game started, session ID:", session.id);
      } catch (error) {
        console.error("Error starg game:", error);
      }
    } else {
      // Not logged in; redirect to login
      navigate("/login", { replace: true });
    }
  };
  // Initialize/reset score only once per new session to avoid infinite update loop
  useEffect(() => {
    if (!gameSession) return;
    // Only reset if score isn't already 0 (fresh session) – prevents creating a new object each render
    if (gameSession.score !== 0) {
      setGameSession({ ...gameSession, score: 0 });
    }
    setSong(null);
    // Depend only on session id so this runs once when a new session is created
  }, [gameSession?.id]);

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{
        height: "95vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        textAlign: "center",
      }}
      direction={"column"}
    >
      <Typography
        variant="h2"
        gutterBottom
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: "bold",
          color: "#111",
          letterSpacing: "2px",
          zIndex: 1,
        }}
      >
        ...Ready For It?
      </Typography>

      <Grid
        container
        direction="column"
        alignItems="center"
        spacing={3}
        style={{ marginBottom: "2rem" }}
      >
        <Grid container justifyContent="center" spacing={2}>
          <Grid>
            <Typography
              variant="h4"
              gutterBottom
              style={{
                fontFamily: "'Poppins', sans-serif",
                color: "#111",
                letterSpacing: "2px",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              Oh Hi, {userName}!
            </Typography>
          </Grid>
          {/* Guest Logout removed */}
        </Grid>

        <Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartGame}
            style={{
              padding: "1rem 3rem",
              borderRadius: "30px",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "1.5px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
              minWidth: "250px",
            }}
            disabled={!userName}
          >
            Let the Game Begin
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/game-history")}
            style={{
              padding: "1rem 3rem",
              borderRadius: "30px",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "1.5px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
              minWidth: "250px",
              marginTop: "1rem",
            }}
          >
            View Game History
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/top-players")}
            style={{
              padding: "1rem 3rem",
              borderRadius: "30px",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "1.5px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
              minWidth: "250px",
              marginTop: "1rem",
            }}
          >
            🏆 Best Game Scores
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default StartGame;
