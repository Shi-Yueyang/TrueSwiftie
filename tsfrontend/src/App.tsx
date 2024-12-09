

import { useState } from "react";
import "./App.css";

import GamePage from "./GamePage";
import StartGame from "./StartGame";

function App() {
  
  const [isStarted, setIsStarted] = useState(false);
  const [username, setUsername] = useState<string>("");
  const handleStart = (name:string) => {
    setUsername(name);
    setIsStarted(true);
  };
  return (
    <>
      {!isStarted ? (
        <StartGame  handleStart={handleStart} />
        ) : (
          <GamePage userName={username}/>
        )}
    </>
  );
}

export default App;
