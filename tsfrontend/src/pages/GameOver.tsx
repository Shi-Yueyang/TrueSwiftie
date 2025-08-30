import { useContext, useEffect, useState } from "react";
import { Typography, Button, Box, Stack } from "@mui/material";
import { AppContext } from "../context/AppContext";
import RankList from "../components/RankList";
import axios from "axios";
import MusicDisplay from "../components/MusicDisplay";
import { usePoster } from "../hooks/hooks";
import CommentPopover from "../components/CommentPopover";
import { useNavigate } from "react-router-dom";
import { AuthContext, User } from "../context/AuthContex";

export interface GameHistory {
  id: number;
  user: User;
  score: number;
  start_time:string;
  correct_choice:string
  likes:number;
}

const GameOver = () => {
  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const {  song, setGameState } = context;
  const {userName } = useContext(AuthContext);

  const [GameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [showRankList, setShowRankList] = useState(false);
  const poster = usePoster(song);

  // popover state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null); 
  const open = Boolean(anchorEl);

  const handleRestart = () => {
    navigate("/");
  };

  const handleSubmit = async (comment: string) => {
    try {
      console.log('post')
      await axios.post(`${backendIp}/ts/comments/`, {
        user: userName,
        comment,
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }

  useEffect(() => {
    // ensure we are in gameOver state; keep audio playing
    setGameState("gameOver");
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
      <Button
        variant="contained"
        color="secondary"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        Leave a Comment
      </Button>
      <CommentPopover
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          setAnchorEl(null);
        }}
        onSubmit={handleSubmit}
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
        Your Swiftiness: {1}
      </Typography>

      {showRankList ? (
        <RankList gamehistories={GameHistory} />
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
