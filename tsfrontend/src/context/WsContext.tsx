import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

// Base WS host, e.g. ws://localhost:8001 (no trailing slash preferred)
const WS_BASE = (import.meta as any).env.VITE_BACKEND_WS as string;

export type WsEvent = {
  type: string;
  data?: any;
  sender?: number | null;
};

interface WsContextValue {
  // Controls
  connect: (roomId: string | number) => void;
  disconnect: () => void;
  send: (type: string, data?: any) => boolean;

  // State
  connected: boolean;
  readyState: number; // WebSocket readyState
  roomId: string | null;
  wsUrl: string | null;
  lastMessage: WsEvent | null;
}

const WsContext = createContext<WsContextValue | undefined>(undefined);

export const WsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WsEvent | null>(null);

  const buildUrl = useCallback((rid: string | number) => {
    const base = (WS_BASE || "").replace(/\/+$/, "");
    const token = localStorage.getItem("accessToken");
    const url = `${base}/ws/ts/dualmode/${rid}/`;
    if (token) {
      return `${url}?token=${token}`;
    }
    return url;
  }, []);

  const disconnect = useCallback(() => {
    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;
    setConnected(false);
    setReadyState(WebSocket.CLOSED);
    console.log("Disconnected room", roomId);
  }, [roomId]);

  const connect = useCallback((rid: string | number) => {
    const url = buildUrl(rid);
    setRoomId(String(rid));
    setWsUrl(url);

    // Close any existing connection first
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setReadyState(ws.readyState);
        console.log(`Connected to room ${url}`);
      };
      ws.onclose = () => {
        setConnected(false);
        setReadyState(WebSocket.CLOSED);
        console.log("Socket closed");
      };
      ws.onerror = (ev: Event) => {
        setReadyState(ws.readyState);
        console.log(`Error: ${(ev as any)?.message ?? "event"}`);
      };
      ws.onmessage = (ev: MessageEvent<string>) => {
        console.log(`<- ${ev.data}`);
        try {
          const parsed = JSON.parse(ev.data);
          setLastMessage({
            type: String(parsed?.type ?? "message"),
            data: parsed?.data,
            sender: parsed?.sender ?? null,
          });
        } catch {
          // Non-JSON payloads
          setLastMessage({ type: "raw", data: ev.data, sender: null });
        }
      };
    } catch (e: any) {
      console.log(`Connect failed: ${e?.message ?? String(e)}`);
    }
  }, [buildUrl]);

  const send = useCallback((type: string, data?: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WebSocket is not open");
      return false;
    }
    const payload = { type, data: data ?? {} };
    ws.send(JSON.stringify(payload));
    console.log(`-> ${JSON.stringify(payload)}`);
    return true;
  }, []);

  const value = useMemo<WsContextValue>(() => ({
    connect,
    disconnect,
    send,
    connected,
    readyState,
    roomId,
    wsUrl,
    lastMessage,
  }), [connect, disconnect, send, connected, readyState, roomId, wsUrl, lastMessage]);

  // Cleanup on unmount
  React.useEffect(() => () => {
    try { wsRef.current?.close(); } catch {}
  }, []);

  return (
    <WsContext.Provider value={value}>{children}</WsContext.Provider>
  );
};

export const useWs = () => {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error("useWs must be used within a WsProvider");
  return ctx;
};
