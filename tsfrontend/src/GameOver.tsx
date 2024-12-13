import { useContext, useEffect, useState } from "react";
import { Typography, Button, Box, Stack } from "@mui/material";
import { AppContext } from "./AppContext";
import RankList from "./RankList";
import axios from "axios";

export interface GameHistory {
  id: number;
  player_name: string;
  score: number;
}

const GameOver = () => {
  const context = useContext(AppContext);
  const { setGameState, score,username } = context;
  console.log(username)
  const [GameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const backendIp = import.meta.env.VITE_BACKEND_IP;

  const handleRestart = () => {
    setGameState("initial");
  };

  useEffect(() => {
    const fetchTopScores = async () => {
      try {
        const response = await axios.get(
          `${backendIp}/ts/game-histories/top-scores/`
        );
        setGameHistory(response.data);
      } catch (error) {
        console.error("Error fetching top scores:", error);
      }
    };
    fetchTopScores();
  }, []);

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        height: "100vh",
        textAlign: "center",
        position: "relative",
        padding: "2rem",
      }}
      spacing={2}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      />
      <Typography
        variant="h2"
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: "bold",
          color: "#FFD700",
          marginBottom: "1rem",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        End Game
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          marginBottom: "2rem",
          color: "#5af",
          textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
        }}
      >
        Your Swiftiness: {score}
      </Typography>
      <RankList scoreRank={GameHistory} />
      <Button
        variant="contained"
        color="primary"
        onClick={handleRestart}
        sx={{
          padding: "0.75rem 2rem",
          borderRadius: "30px",
          fontSize: "1rem",
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "1.5px",
          backgroundColor: "#F5A3C7",
          "&:hover": {
            backgroundColor: "#FF80B5",
          },
          marginTop: "2rem",
        }}
      >
        Oh, here we go again.
      </Button>
    </Stack>
  );
};

export default GameOver;