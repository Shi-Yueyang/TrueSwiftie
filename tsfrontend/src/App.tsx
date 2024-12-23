import { useContext } from "react";
import "./styles/App.css";

import GamePage from "./components/GamePage";
import StartGame from "./components/StartGame";
import { AppContext } from "./context/AppContext";
import GameOver from "./components/GameOver";
import Snowfall from "react-snowfall";

function App() {
  const context = useContext(AppContext);
  const { gameState, snowfallProps } = context;

  console.log(snowfallProps)
  return (
    <>
      <Snowfall {...snowfallProps}/>
      {gameState === "initial" && <StartGame />}
      {gameState === "playing" && <GamePage />}
      {gameState === "gameOver" && <GameOver />}
    </>
  );
}

export default App;
