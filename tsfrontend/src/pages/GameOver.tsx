import { useContext, useMemo, useState } from "react";
import { Typography, Button, Box, Stack, Paper } from "@mui/material";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { usePoster } from "../hooks/hooks";
import CommentPopover from "../components/CommentPopover";
import { useNavigate } from "react-router-dom";
import { AuthContext, User } from "../context/AuthContex";

export interface GameHistory {
  id: number;
  user: User;
  score: number;
  start_time: string;
  correct_choice: string;
  likes: number;
}

const GameOver = () => {
  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const navigate = useNavigate();
  const { song, gameSession } = useContext(AppContext);
  const { userName } = useContext(AuthContext);

  const poster = usePoster(song);
  const bgImage = useMemo(() => poster?.image ?? null, [poster]);

  // popover state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleRestart = () => {
    navigate("/");
  };

  const handleSubmit = async (comment: string) => {
    try {
      console.log("post");
      await axios.post(`${backendIp}/ts/comments/`, {
        user: userName,
        comment,
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };



  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        textAlign: "center",
        position: "relative",
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
        overflow: "visible",
      }}
      spacing={3}
    >
      {/* Background poster */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: bgImage ? `url(${bgImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(2px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />


      <CommentPopover
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          setAnchorEl(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* Foreground content */}
      <Box sx={{ position: "relative", zIndex: 2, width: "100%" }}>
        <Paper
          elevation={6}
          sx={{
            mx: "auto",
            maxWidth: 720,
            borderRadius: 3,
            px: { xs: 2.5, sm: 4 },
            py: { xs: 3, sm: 4 },
            backdropFilter: "blur(4px)",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0,0,0,0.35)"
                : "rgba(255,255,255,0.65)",
            transform: { xs: "translateY(-8vh)" },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              letterSpacing: 0.5,
              mb: 1,
            }}
          >
            游戏结束
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ opacity: 0.9, mb: 2 }}
          >
            你的Swiftiness:
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              lineHeight: 1,
              mb: 2,
              textShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 1px 2px rgba(0,0,0,0.8)"
                  : "0 1px 2px rgba(0,0,0,0.25)",
            }}
          >
            {gameSession?.score ?? 0}
          </Typography>

          {/* Correct answer (concise) */}
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
            {song?.song_title?.title || "Unknown"}
            {song?.song_title?.album ? ` — ${song.song_title.album}` : ""}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleRestart}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: 999,
                fontWeight: 700,
              }}
            >
              返回主页
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ px: 3, py: 1.25, borderRadius: 999 }}
            >
              留言
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
};

export default GameOver;
