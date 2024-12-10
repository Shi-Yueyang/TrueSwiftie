import { useContext } from "react";
import "./App.css";

import GamePage from "./GamePage";
import StartGame from "./StartGame";
import { AppContext } from "./AppContext";
import GameOver from "./GameOver";

function App() {
  const context = useContext(AppContext);
  const { gameState } = context;


  return (
    <>
      {gameState === "initial" && <StartGame />}
      {gameState === "playing" && <GamePage />}
      {gameState === "gameOver" && <GameOver/>}
    </>
  );
}

export default App;
