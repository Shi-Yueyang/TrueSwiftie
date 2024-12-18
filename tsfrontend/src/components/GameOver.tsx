import { useContext, useEffect, useState } from "react";
import { Typography, Button, Box, Stack } from "@mui/material";
import { AppContext } from "../context/AppContext";
import RankList from "./RankList";
import axios from "axios";
import MusicDisplay from "./MusicDisplay";
import { usePoster } from "../hooks/hooks";

export interface GameHistory {
  id: number;
  player_name: string;
  score: number;
}

const GameOver = () => {
  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const context = useContext(AppContext);
  const { setGameState, score, song } = context;
  const [GameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [showRankList, setShowRankList] = useState(false);
  const poster = usePoster(song);

  const handleRestart = () => {
    setGameState("initial");
  };

  useEffect(() => {
    const fetchTopScores = async () => {
      try {
        const response = await axios.get(
          `${backendIp}/ts/game-histories/top-scores/`
        );
        setGameHistory(response.data.results);
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
      {showRankList ? (
        <RankList scoreRank={GameHistory} />
      ) : (
        poster && (
          <MusicDisplay
            imageUrl={poster.image}
            onButtonClick={() => {
              setShowRankList(!showRankList);
            }}
          />
        )
      )}

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
        Again
      </Button>
    </Stack>
  );
};

export default GameOver;
