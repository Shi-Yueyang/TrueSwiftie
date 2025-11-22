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
  log: string[];
}

const WsContext = createContext<WsContextValue | undefined>(undefined);

export const WsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WsEvent | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const appendLog = useCallback((line: string) => {
    setLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} - ${line}`,
    ].slice(-500));
  }, []);

  const buildUrl = useCallback((rid: string | number) => {
    const base = (WS_BASE || "").replace(/\/+$/, "");
    return `${base}/ws/ts/dualmode/${rid}/`;
  }, []);

  const disconnect = useCallback(() => {
    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;
    setConnected(false);
    setReadyState(WebSocket.CLOSED);
    appendLog("Disconnected");
  }, [appendLog]);

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
        appendLog(`Connected to ${url}`);
      };
      ws.onclose = () => {
        setConnected(false);
        setReadyState(WebSocket.CLOSED);
        appendLog("Socket closed");
      };
      ws.onerror = (ev: Event) => {
        setReadyState(ws.readyState);
        appendLog(`Error: ${(ev as any)?.message ?? "event"}`);
      };
      ws.onmessage = (ev: MessageEvent<string>) => {
        appendLog(`<- ${ev.data}`);
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
      appendLog(`Connect failed: ${e?.message ?? String(e)}`);
    }
  }, [appendLog, buildUrl]);

  const send = useCallback((type: string, data?: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      appendLog("WebSocket is not open");
      return false;
    }
    const payload = { type, data: data ?? {} };
    ws.send(JSON.stringify(payload));
    appendLog(`-> ${JSON.stringify(payload)}`);
    return true;
  }, [appendLog]);

  const value = useMemo<WsContextValue>(() => ({
    connect,
    disconnect,
    send,
    connected,
    readyState,
    roomId,
    wsUrl,
    lastMessage,
    log,
  }), [connect, disconnect, send, connected, readyState, roomId, wsUrl, lastMessage, log]);

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
