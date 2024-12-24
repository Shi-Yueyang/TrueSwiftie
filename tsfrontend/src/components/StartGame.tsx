import { useContext, useEffect, useState } from "react";
import { Typography, Button, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import "@fontsource/poppins";
import { AppContext } from "../context/AppContext";
import axios from "axios";
const StartGame = () => {
  const context = useContext(AppContext);
  const {
    setGameState,
    setUsername,
    username,
    setStartTime,
    startTime,
    setGameHistoryId,
    sound,
    setSound,
    setScore,
    setSong,

  } = context;

  const [error, setError] = useState<string>("");

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
    setUsername(event.target.value);
  };

  const postGameHistory = async () => {
    const historyData = {
      player_name: username,
      score: 0,
      start_time: startTime,
      end_time: startTime,
      correct_choice: "null",
      last_choice: "null",
    };
    try {
      const csrfTokenResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_IP}/core/csrf/`
      );
      const csrfToken = csrfTokenResponse.data.csrfToken;
      axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_IP}/ts/game-histories/`,
        historyData
      );
      setGameHistoryId(response.data.id);

    } catch (error) {
      console.error("Error posting game history:", error);
    }
  };

  const handleStartGame = () => {
    if (username.trim()) {
      setUsername(username.trim());
      setStartTime(new Date());
      postGameHistory();
      setGameState("playing");
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
      <TextField
        variant="outlined"
        placeholder="Enter your name"
        value={username}
        onChange={handleInputChange}
        error={!!error}
        helperText={error}
        style={{
          marginBottom: "1.5rem",
          backgroundColor: "#fff",
          borderRadius: "50px",
          width: "80%",
          maxWidth: "400px",
          fontFamily: "'Poppins', sans-serif",
        }}
      />

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
      >
        Let the Game Begins
      </Button>
    </Grid>
  );
};

export default StartGame;
