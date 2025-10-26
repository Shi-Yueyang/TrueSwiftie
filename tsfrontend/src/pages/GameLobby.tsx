import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  IoRefreshOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { fetchWaitingRooms, joinRoom, Room as ApiRoom } from "../services/api";

const GameLobby: React.FC = () => {
  const theme = useTheme();
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [query, setQuery] = useState("");

  // Fetch waiting rooms from backend
  const loadRooms = async () => {
    try {
      const data = await fetchWaitingRooms();
      setRooms(data);
    } catch (e) {
      // ignore errors for now; could surface a toast
      setRooms([]);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => String(r.id).toLowerCase().includes(q));
  }, [rooms, query]);

  const handleRefresh = () => {
    loadRooms();
  };

  const handleJoin = async (roomId: number) => {
    try {
      const updated = await joinRoom(roomId);
      setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
    } catch (e) {
      // optionally handle error (room full, unauthorized, etc.)
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 10 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
        >
          Game Lobbies
        </Typography>
        <IconButton aria-label="refresh" onClick={handleRefresh} size="small">
          <IoRefreshOutline />
        </IconButton>
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        size="medium"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a room"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IoSearchOutline />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
        }}
      />

      {/* Rooms */}
      <Stack spacing={2}>
        {filtered.map((room) => {
          return (
            <Card key={room.id} elevation={2} sx={{ borderRadius: 3 }}>
              <CardActionArea sx={{ p: 1.5 }} disableRipple>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {/* Thumbnail placeholder */}
                  <Box
                    sx={{
                      width: 84,
                      height: 84,
                      borderRadius: 2,
                      flex: "0 0 auto",
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="column" spacing={1} alignItems="flex-end">
                      <Typography noWrap sx={{ fontWeight: 700 }}>
                        Room #{room.id}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {1 + (room.player_2 ? 1 : 0)}/2 Players
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoin(room.id);
                        }}
                        sx={{
                          borderRadius: 999,
                          px: 2,
                          py: 0.5,
                          fontWeight: 700,
                          minWidth: 96,
                        }}
                      >
                        Join
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>

      {/* Create Room - sticky bottom */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          backdropFilter: "blur(6px)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 3,
            py: 1.4,
            fontSize: 16,
            fontWeight: 800,
            textTransform: "none",
            width: { xs: "85%", sm: 420 },
            maxWidth: 520,
          }}
        >
          + Create New Room
        </Button>
      </Box>


    </Box>
  );
};

export default GameLobby;
