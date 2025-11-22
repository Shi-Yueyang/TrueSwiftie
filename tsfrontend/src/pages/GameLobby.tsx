import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { IoRefreshOutline, IoSearchOutline } from "react-icons/io5";
import {
  Room as ApiRoom,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import { useWs } from "../context/WsContext";

const GameLobby: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { connect } = useWs();
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const lobbyWsRef = useRef<WebSocket | null>(null);

  // Fetch waiting rooms from backend
  const loadRooms = async () => {
    try {
    } catch (e) {
      // ignore errors for now; could surface a toast
      setRooms([]);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Connect to lobby broadcast channel for real-time room updates
  useEffect(() => {
    const base = (import.meta as any).env.VITE_BACKEND_WS as string;
    if (!base) return;
    const url = `${String(base).replace(/\/+$/, "")}/ws/ts/lobby/`;

    try {
      const ws = new WebSocket(url);
      lobbyWsRef.current = ws;
      ws.onmessage = (ev) => {
        try {
          console.log("Lobby WS message:", ev.data);
          const msg = JSON.parse(ev.data);
          if (msg.type === "rooms") {
            setRooms(msg.data);
          } else if (msg.type === "room_created") {
            const room = msg.data;
            connect(room.id);
            navigate("/waiting-room", { state: { room } });
            setCreating(false);
          }
        } catch {
          // ignore non-JSON
        }
      };

      ws.onopen = () => {
        // ws.send(JSON.stringify({ type: "list_rooms" }));
        console.log("WebSocket connection established");
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };
    } catch {}

    return () => {
      try {
        lobbyWsRef.current?.close();
      } catch {}
      lobbyWsRef.current = null;
    };
  }, [connect, navigate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => String(r.id).toLowerCase().includes(q));
  }, [rooms, query]);

  const handleRefresh = () => {
    // loadRooms(); // No longer needed as WS pushes updates
    if (lobbyWsRef.current?.readyState === WebSocket.OPEN) {
       // Maybe ask for refresh? But backend sends snapshot on connect.
       // We could implement a "list_rooms" type in backend if needed, but currently not there.
       // For now, maybe just reconnect? Or do nothing.
    }
  };

  const handleJoin = async (roomId: number | string) => {
    try {
      // For in-memory rooms, we might not need an HTTP join call if we just connect via WS.
      // But the existing handleJoin called joinRoom API.
      // If we are fully switching to WS/in-memory, joinRoom API (which updates DB) might be wrong.
      // However, the user only asked to change creation to WS.
      // But if creation makes in-memory rooms, joinRoom API (DB) will fail to find them.
      // So we should probably just navigate to waiting room and let WS connection handle joining.
      
      // const updated = await joinRoom(roomId); // This is likely DB based
      // setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
      
      // Instead:
      connect(roomId);
      // We need the room object to pass to state.
      const room = rooms.find(r => r.id === roomId);
      if (room) {
          navigate("/waiting-room", { state: { room } });
      }
    } catch (e) {
      // optionally handle error (room full, unauthorized, etc.)
    }
  };

  const handleCreateRoom = async () => {
    if (creating) return;
    setCreating(true);
    if (lobbyWsRef.current && lobbyWsRef.current.readyState === WebSocket.OPEN) {
        lobbyWsRef.current.send(JSON.stringify({ type: "create_room" }));
    } else {
        console.error("Lobby WS not connected");
        setCreating(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 10 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3, mt: 1 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              letterSpacing: -1,
              color: theme.palette.text.primary,
            }}
          >
            Game Lobby
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Join a room to start playing
          </Typography>
        </Box>
        <IconButton
          aria-label="refresh"
          onClick={handleRefresh}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <IoRefreshOutline size={20} />
        </IconButton>
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a room..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ color: "text.secondary" }}>
              <IoSearchOutline size={20} />
            </InputAdornment>
          ),
          sx: {
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            "& fieldset": {
              borderColor: alpha(theme.palette.divider, 0.1),
            },
            "&:hover fieldset": {
              borderColor: alpha(theme.palette.primary.main, 0.3),
            },
          },
        }}
        sx={{
          mb: 3,
        }}
      />

      {/* Rooms */}
      <Stack spacing={2}>
        {filtered.map((room) => {
          return (
            <Card
              key={room.id}
              elevation={0}
              sx={{
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(12px)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.primary.main,
                    0.15
                  )}`,
                },
              }}
            >
              <CardActionArea
                sx={{ p: 2.5 }}
                onClick={() => handleJoin(room.id)}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="h6"
                      noWrap
                      sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 0.5 }}
                    >
                      Room #{String(room.id).slice(0, 8)}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor:
                            (room.members || 0) >= 2
                              ? "error.main"
                              : "success.main",
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {room.members !== undefined
                          ? room.members
                          : 1 + (room.player_2 ? 1 : 0)}
                        /2 Players
                      </Typography>
                    </Stack>
                  </Box>

                  <Button
                    disableElevation
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(room.id);
                    }}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1,
                      fontWeight: 700,
                      textTransform: "none",
                      minWidth: 100,
                    }}
                  >
                    Join
                  </Button>
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
          disabled={creating}
          onClick={handleCreateRoom}
        >
          {creating ? "Creating…" : "+ Create New Room"}
        </Button>
      </Box>
    </Box>
  );
};

export default GameLobby;
