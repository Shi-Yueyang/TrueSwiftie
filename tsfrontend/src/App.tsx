import { useContext } from "react";
import './styles/App.css';

import GamePage from "./components/GamePage";
import StartGame from "./components/StartGame";
import { AppContext } from "./context/AppContext";
import GameOver from "./components/GameOver";

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
