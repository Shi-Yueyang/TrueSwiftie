import { createContext, useState, ReactNode } from "react";
import { Howl } from "howler";

type GameState = "initial" | "playing" | "gameOver";

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
});

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>("initial");
  const [username, setUsername] = useState<string>("");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [score, setScore] = useState<number>(0);
  const [gameHistoryId, setGameHistoryId] = useState(0);
  const [sound, setSound] = useState<Howl | null>(null);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
