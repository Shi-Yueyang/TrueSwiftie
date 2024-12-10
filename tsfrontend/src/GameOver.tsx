import { useContext, useEffect, useState } from "react";
import { Typography, Button, Card, CardContent, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { AppContext } from "./AppContext";
import RankList from "./RankList";
import axios from "axios";

export interface GameHistory{
  player_name:string;
  score:number;
}

const GameOver = () => {
  const context = useContext(AppContext);
  const { setGameState, score } = context;
  const [GameHistory,setGameHistory] = useState<GameHistory[]>([]);
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

  const scoreRank = [{ name: "syy", score: 1 }];
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{
        height: "95vh",
        textAlign: "center",
        position: "relative",
      }}
      direction="column"
    >
      {/* Overlay for contrast */}
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
          color: "#FFD700", // Golden text for celebration
          marginBottom: "1rem",
        }}
      >
        Game Over!
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          marginBottom: "2rem",
        }}
      >
        Your Score: {score}
      </Typography>

      {/* Score Rank */}
      <Card
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          marginBottom: "2rem",
          maxWidth: 400,
          borderRadius: "16px",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "#333",
            }}
          >
            Score Rank
          </Typography>
          <RankList scoreRank={GameHistory} />
        </CardContent>
      </Card>

      {/* Restart Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleRestart}
        sx={{
          padding: "0.75rem 2rem",
          borderRadius: "30px",
          fontSize: "1.25rem",
          fontFamily: "'Poppins', sans-serif",
          letterSpacing: "1.5px",
          backgroundColor: "#F5A3C7",
          "&:hover": {
            backgroundColor: "#FF80B5",
          },
        }}
      >
        Oh, here we go again.
      </Button>
    </Grid>
  );
};

export default GameOver;
