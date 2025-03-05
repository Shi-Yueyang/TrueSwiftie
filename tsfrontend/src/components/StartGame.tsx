import { useContext, useEffect, useState } from "react";
import { Typography, Button, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import "@fontsource/poppins";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { AuthContext } from "../context/AuthContex";
import { useNavigate } from "react-router-dom";

const StartGame = () => {
  const navigate = useNavigate();
  const {
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
  const {userName,userId, isStaff,groups,login, logout } = useContext(AuthContext);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    if(isStaff || groups?.includes("formal")){
      setIsGuest(false);
    }
    else{
      setIsGuest(true);
    }
  }
  , [isStaff,groups]);

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
      login(
        response.data.userId,
        response.data.temporary_name,
        response.data.accessToken,
        response.data.refreshToken,
        response.data.is_staff,
        response.data.groups
      );
    }
  };

  const handleStartGame = async () => {
    if (userName) {
      setStartTime(new Date());
      const historyData = {
        user: userId,
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
        navigate("/game");
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
          zIndex: 1, 
        }}
      >
        ...Ready For It?
      </Typography>

      {/* Name Input */}

      {userName ? (
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
          {isGuest  && 
            <Grid>
              <Button
                variant="outlined"
                color="secondary"
                onClick={logout}
                style={{
                  padding: "1rem 2rem",
                  borderRadius: "30px",
                  fontFamily: "'Poppins', sans-serif",
                  letterSpacing: "1px",
                }}
              >
                Guest Logout
              </Button>
            </Grid>
          }
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
      ) : (
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
          style={{ marginBottom: "1.5rem", padding: "0 16px" }}
        >
          <Grid size={{ xs: 6, md: 8 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter your name"
              value={temporaryName}
              onChange={handleInputChange}
              error={!!error}
              helperText={error}
              style={{
                backgroundColor: "#fff",
                borderRadius: "50px",
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </Grid>
          <Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTemporaryLogin}
              style={{
                borderRadius: "30px",
                padding: "0.8rem 2rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Guest Login
            </Button>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default StartGame;
