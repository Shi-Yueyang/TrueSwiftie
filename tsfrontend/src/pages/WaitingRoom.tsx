import { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { IoArrowBackOutline, IoAddOutline, IoCheckmark } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { Room } from "../services/api";
import { useWs } from "../context/WsContext";
import { AuthContext, User } from "../context/AuthContex";


// A self-contained waiting room page matching the provided mock.
const WaitingRoom = ({}) => {
  const theme = useTheme();
  const [ready, setReady] = useState<boolean>(false);
  const location = useLocation();
  const { connect, disconnect, connected, roomId } = useWs();
  const roomFromState = (location.state as any)?.room as Room | undefined;
  const { userName, avatar } = useContext(AuthContext);
  const [opponent] = useState<User | null>(null);

  const handleBack = () => {
    disconnect();
    window.history.back();
  };

  // Disconnect on unmount (e.g. browser back button)
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const toggleReady = () => {
    const next = !ready;
    setReady(next);
  };

  // Auto-connect if navigated with a room and no active connection
  useEffect(() => {
    if (
      roomFromState?.id &&
      (!connected || roomId !== String(roomFromState.id))
    ) {
      connect(roomFromState.id);
    }
  }, [roomFromState?.id, connected, roomId, connect]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor:
          theme.palette.mode === "dark"
            ? "#1d120d"
            : alpha(theme.palette.common.black, 0.03),
      }}
    >
      {/* Top bar */}
      <Stack direction="row" alignItems="center" sx={{ px: 2, pt: 2, pb: 1 }}>
        <IconButton
          aria-label="back"
          onClick={handleBack}
          size="small"
          sx={{ mr: 1 }}
        >
          <IoArrowBackOutline />
        </IconButton>
        <Box sx={{ flex: 1, textAlign: "center", mr: 5 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 0.4 }}
          >
            Room Code: {roomId || roomFromState?.id || "..."}
          </Typography>
        </Box>
      </Stack>

      {/* Players row */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
        }}
      >
        <Stack
          direction="row"
          spacing={4}
          alignItems="center"
          sx={{ width: "100%", maxWidth: 420 }}
        >
          {/* You */}
          <Stack alignItems="center" spacing={1.25} sx={{ flex: 1 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={avatar ?? ""}
                alt={userName??""}
                sx={{ width: 88, height: 88, boxShadow: 3 }}
              >
                {userName?.[0] ?? "Y"}
              </Avatar>
              {1 && (
                <Chip
                  icon={<IoCheckmark size={16} />}
                  label=""
                  color="success"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: -6,
                    right: -6,
                    height: 24,
                    "& .MuiChip-label": { p: 0 },
                  }}
                />
              )}
            </Box>
            <Typography sx={{ fontWeight: 800 }}>{userName??""}</Typography>
            <Typography variant="caption" color="text.secondary">
              You
            </Typography>
          </Stack>

          {/* VS */}
          <Typography
            sx={{ fontWeight: 900, color: theme.palette.warning.main }}
          >
            VS
          </Typography>

          {/* Opponent */}
          <Stack alignItems="center" spacing={1.25} sx={{ flex: 1 }}>
            {opponent ? (
              <>
                <Avatar
                  src={opponent.avatar}
                  alt={opponent.username}
                  sx={{ width: 88, height: 88 }}
                >
                  {opponent.username?.[0] ?? "?"}
                </Avatar>
                <Typography sx={{ fontWeight: 800 }}>
                  {opponent.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Opponent
                </Typography>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    border: "2px dashed",
                    borderColor: alpha(theme.palette.text.primary, 0.3),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.palette.text.secondary,
                  }}
                >
                  <IoAddOutline size={24} />
                </Box>
                <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
                  Waiting...
                </Typography>
              </>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Bottom area */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mb: 1.5 }}
        >
          The game will start once both players are ready.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={toggleReady}
            variant="contained"
            sx={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 999,
              py: 1.4,
              fontWeight: 900,
              textTransform: "none",
              background: `linear-gradient(180deg, ${
                theme.palette.warning.main
              }, ${alpha(theme.palette.warning.main, 0.9)})`,
              boxShadow: `0 8px 24px ${alpha(
                theme.palette.warning.main,
                0.35
              )}`,
            }}
          >
            {ready ? "Unready" : "Ready"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default WaitingRoom;
