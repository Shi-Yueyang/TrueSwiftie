import { createContext, useState, ReactNode } from "react";
import { Howl } from "howler";
import { Song } from "../components/MusicQuiz";

type GameState = "initial" | "playing" | "gameOver";
interface SnowfallProps {
  color?: string;
  snowflakeCount?: number;
  wind?: [number, number];
}
const albumColors = [
  "#A5C9A5",
  "#EFC180",
  "#C7A8CB",
  "#7A2E39",
  "#B5E5F8",
  "#746F70",
  "#F7B0CC",
  "#CDC9C1",
  "#C5AC90",
  "#242E47",
];
export interface GameTurn {
  id: number;
  song: number;
  options: string[];
  poster_url: string;
  time_limit_secs: number;
  outcome: "pending" | "correct" | "wrong" | "timeout";
}

export interface GameSession {
  id: number;
  user: number;
  score: number;
  health:number;
  version: number;
  current_turn: number;
  next_turn: number;
  status: string;
}

interface AppContextProps {
  gameState: GameState;
  setGameState: (isStarted: GameState) => void;
  username: string;
  setUsername: (username: string) => void;
  startTime: Date;
  setStartTime: (startTime: Date) => void;
  gameSession: GameSession | null;
  setGameSession: (session: GameSession | null) => void;
  currentTurn: GameTurn | null;
  setCurrentTurn: (t: GameTurn | null) => void;
  nextTurn: GameTurn | null;
  setNextTurn: (t: GameTurn | null) => void;
  sound: Howl | null;
  setSound: (sound: Howl | null) => void;
  nextSound: Howl | null;
  setNextSound: (sound: Howl | null) => void;
  song: Song | null;
  setSong: (song: Song | null) => void;
  csrfToken: string;
  setCsrfToken: (csrfToken: string) => void;
  snowfallProps: SnowfallProps | null;
  setSnowfallProps: (snowfallProps: SnowfallProps | null) => void;
}

const AppContext = createContext<AppContextProps>({
  gameState: "initial",
  username: "",
  setGameState: () => {},
  setUsername: () => {},
  startTime: new Date(),
  setStartTime: () => {},
  gameSession: null,
  setGameSession: () => {},
  currentTurn: null,
  setCurrentTurn: () => {},
  nextTurn: null,
  setNextTurn: () => {},
  sound: null,
  setSound: () => {},
  nextSound: null,
  setNextSound: () => {},
  song: null,
  setSong: () => {},
  csrfToken: "",
  setCsrfToken: () => {},
  snowfallProps: null,
  setSnowfallProps: () => {},
});

const AppProvider = ({ children }: { children: ReactNode }) => {
  const randomColor =
    albumColors[Math.floor(Math.random() * albumColors.length)];
  const [gameState, setGameState] = useState<GameState>("initial");
  const [username, setUsername] = useState<string>("");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentTurn, setCurrentTurn] = useState<GameTurn | null>(null);
  const [nextTurn, setNextTurn] = useState<GameTurn | null>(null);
  const [sound, setSound] = useState<Howl | null>(null);
  const [nextSound, setNextSound] = useState<Howl | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [snowfallProps, setSnowfallProps] = useState<SnowfallProps | null>({
    color: randomColor,
  });

  return (
    <AppContext.Provider
      value={{
        gameState,
        username,
        setGameState,
        setUsername,
        startTime,
        setStartTime,
        gameSession,
        setGameSession,
        currentTurn,
        setCurrentTurn,
        nextTurn,
        setNextTurn,
        sound,
        setSound,
        nextSound,
        setNextSound,
        song,
        setSong,
        csrfToken,
        setCsrfToken,
        snowfallProps,
        setSnowfallProps,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
