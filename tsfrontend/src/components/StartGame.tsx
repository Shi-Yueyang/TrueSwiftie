import { useContext, useEffect } from "react";
import { Typography, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import "@fontsource/poppins";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { startGameSession } from "../services/api";
import { AuthContext } from "../context/AuthContex";
import { useNavigate } from "react-router-dom";

const StartGame = () => {
  const navigate = useNavigate();
  const {
    setStartTime,
    setGameSessionId,
    setSessionVersion,
    setCurrentTurn,
    sound,
    setSound,
    setScore,
    setSong,
    setGameState,
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
        const csrfTokenResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_IP}/core/csrf/`
        );
        const csrfToken = csrfTokenResponse.data.csrfToken;
        axios.defaults.headers.common["X-CSRFToken"] = csrfToken;
        const session = await startGameSession();
        setGameSessionId(session.id);
        setSessionVersion(session.version);
        setCurrentTurn(session.current_turn || null);
        setGameState("playing");
        navigate("/game");
      } catch (error) {
        console.error("Error posting game history:", error);
      }
    } else {
      // Not logged in; redirect to login
      navigate("/login", { replace: true });
    }
  };
  useEffect(() => {
    setScore(0);
    setSong(null);
  }, []);

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
      </Grid>
    </Grid>
  );
};

export default StartGame;
