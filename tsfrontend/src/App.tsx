import { useContext } from "react";
import "./styles/App.css";

import GamePage from "./components/GamePage";
import StartGame from "./components/StartGame";
import { AppContext } from "./context/AppContext";
import GameOver from "./components/GameOver";
import Snowfall from "react-snowfall";
import { AuthContext } from "./context/AuthContex";
import { Button } from "@mui/material";

function App() {
  const { gameState, snowfallProps } = useContext(AppContext);
  const { userName } = useContext(AuthContext);

  return (
    <>
      {/* <Snowfall {...snowfallProps} /> */}
      {userName ? (
        <>
          {gameState === "initial" && <StartGame />}
          {gameState === "playing" && <GamePage />}
          {gameState === "gameOver" && <GameOver />}
        </>
      ) : (
        <StartGame />
      )}
    </>
  );
}
export default App;
