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
interface AppContextProps {
  gameState: GameState;
  setGameState: (isStarted: GameState) => void;
  username: string;
  setUsername: (username: string) => void;
  startTime: Date;
  setStartTime: (startTime: Date) => void;
  score: number;
  setScore: (score: number) => void;
  gameHistoryId: number;
  setGameHistoryId: (gameHistoryId: number) => void;
  sound: Howl | null;
  setSound: (sound: Howl | null) => void;
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
  score: 0,
  setScore: () => {},
  gameHistoryId: 0,
  setGameHistoryId: () => {},
  sound: null,
  setSound: () => {},
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
  const [score, setScore] = useState<number>(0);
  const [gameHistoryId, setGameHistoryId] = useState(0);
  const [sound, setSound] = useState<Howl | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [snowfallProps, setSnowfallProps] = useState<SnowfallProps | null>(
    {color:randomColor}
  );

  return (
    <AppContext.Provider
      value={{
        gameState,
        username,
        setGameState,
        setUsername,
        startTime,
        setStartTime,
        score,
        setScore,
        gameHistoryId,
        setGameHistoryId,
        sound,
        setSound,
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
