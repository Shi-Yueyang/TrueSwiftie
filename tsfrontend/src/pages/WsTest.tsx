import { useState } from "react";
import { Box, Button, Divider, Stack, TextField, Typography, Paper } from "@mui/material";
import { useWs } from "../context/WsContext";

export default function WsTest() {
  const [roomId, setRoomId] = useState<string>("1");
  const [message, setMessage] = useState<string>("");
  const { connect, disconnect, send, connected, wsUrl, log } = useWs();

  const doConnect = () => connect(roomId);
  const doSend = () => {
    if (!message) return;
    const ok = send("chat", { text: message });
    if (ok) setMessage("");
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        WebSocket Test (Channels)
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            sx={{ width: { xs: "100%", sm: 160 } }}
            size="small"
          />
          <TextField
            label="WebSocket URL"
            value={wsUrl ?? "(not connected)"}
            InputProps={{ readOnly: true }}
            fullWidth
            size="small"
          />
          {connected ? (
            <Button variant="contained" color="error" onClick={disconnect}>
              Disconnect
            </Button>
          ) : (
            <Button variant="contained" onClick={doConnect}>
              Connect
            </Button>
          )}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            size="small"
          />
          <Button variant="outlined" onClick={doSend} disabled={!connected || !message}>
            Send
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Log
        </Typography>
        <Box
          component="pre"
          sx={{
            maxHeight: 360,
            overflow: "auto",
            m: 0,
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            fontSize: 13,
          }}
        >
          {log.join("\n") || "No messages yet."}
        </Box>
      </Paper>
    </Box>
  );
}
