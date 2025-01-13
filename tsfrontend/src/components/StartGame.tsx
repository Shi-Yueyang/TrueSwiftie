import { useContext, useEffect, useState } from "react";
import { Typography, Button, TextField, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import "@fontsource/poppins";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { AuthContext } from "../context/AuthContex";
const StartGame = () => {
  const {
    setGameState,
    setStartTime,
    startTime,
    setGameHistoryId,
    sound,
    setSound,
    setScore,
    setSong,
  } = useContext(AppContext);

  const [error, setError] = useState<string>("");
  const [temporaryName, setTemporaryName] = useState<string>("");
  const { userId, userName, login, logout } = useContext(AuthContext);

  if (sound) {
    if (sound) {
      sound.fade(1, 0, 1000);
      setTimeout(() => {
        sound.stop();
      }, 1000);
    }
    setSound(null);
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemporaryName(event.target.value);
  };

  const handleTemporaryLogin = async () => {
    if (!userName) {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_IP}/core/temporary-login/`,
        { temporary_name: temporaryName }
      );
      console.log(response.data);
      login(
        response.data.userId,
        response.data.temporary_name,
        response.data.accessToken,
        response.data.refreshToken
      );
    }
  };

  const handleStartGame = async () => {
    if (userName) {
      console.log("logged in");
      setStartTime(new Date());
      const historyData = {
        player_name: userName,
        score: 0,
        start_time: startTime,
        end_time: startTime,
        correct_choice: "null",
        last_choice: "null",
      };
      try {
        // create CSRF token
        const csrfTokenResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_IP}/core/csrf/`
        );
        const csrfToken = csrfTokenResponse.data.csrfToken;
        axios.defaults.headers.common["X-CSRFToken"] = csrfToken;

        // post game history
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_IP}/ts/game-histories/`,
          historyData
        );
        setGameHistoryId(response.data.id);
        setGameState("playing");
      } catch (error) {
        console.error("Error posting game history:", error);
        setError("Failed to start the game. Please try again.");
      }
    } else {
      setError("Please enter your name!");
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
          zIndex: 1, // Ensure the text is above the overlay
        }}
      >
        ...Ready For It?
      </Typography>

      {/* Name Input */}

      {userName ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ marginBottom: "1.5rem" }}
        >
          <Typography
            variant="h4"
            gutterBottom
            style={{
              fontFamily: "'Poppins', sans-serif",
              color: "#111",
              letterSpacing: "2px",
              zIndex: 1,
              marginBottom: "1.5rem",
            }}
          >
            Welcome back, {userName}!
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={logout}
            style={{ marginLeft: "1rem" }}
          >
            Guest Logout
          </Button>
        </Box>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ marginBottom: "1.5rem" }}
        >
          <TextField
            variant="outlined"
            placeholder="Enter your name"
            value={temporaryName}
            onChange={handleInputChange}
            error={!!error}
            helperText={error}
            style={{
              backgroundColor: "#fff",
              borderRadius: "50px",
              width: "80%",
              maxWidth: "400px",
              fontFamily: "'Poppins', sans-serif",
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleTemporaryLogin}
            style={{ marginLeft: "1rem" }}
          >
            Guest Login
          </Button>
        </Box>
      )}

      {/* Start Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleStartGame}
        style={{
          fontSize: "1.25rem",
          padding: "1rem 3rem",
          borderRadius: "30px",

          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "1.5px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
        }}
        disabled={!userName}
      >
        Let the Game Begins
      </Button>
    </Grid>
  );
};

export default StartGame;
