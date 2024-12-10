import { createContext, useState, ReactNode } from "react";

type GameState = "initial" | "playing" | "gameOver" ;

interface AppContextProps {
  gameState: GameState;
  setGameState: (isStarted: GameState) => void;
  username: string;
  setUsername: (username: string) => void;
  startTime: Date;
  setStartTime: (startTime: Date) => void;
  score:number;
  setScore:(score:number)=>void;
}

const AppContext = createContext<AppContextProps>({
  gameState: "initial",
  username: "",
  setGameState: () => {},
  setUsername: () => {},
  startTime: new Date(),
  setStartTime: () => {},
  score:0,
  setScore:()=>{}
});

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>("initial");
  const [username, setUsername] = useState<string>("");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [score,setScore] = useState<number>(0);
  return (
    <AppContext.Provider
      value={{ gameState, username, setGameState, setUsername,startTime,setStartTime,score,setScore }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
