// import { useContext } from "react";
// import { AppContext } from "./context/AppContext";
// import Snowfall from "react-snowfall";

import GamePage from "./components/GamePage";
import {  Route, Routes } from "react-router-dom";
import GameOver from "./components/GameOver";
import StartGame from "./components/StartGame";
import { Stack } from "@mui/material";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./styles/App.css";
import GameHistoryList from "./components/GameHistoryList";

function App() {
  // const {  snowfallProps } = useContext(AppContext);

  return (
    <>
      {/* <Snowfall {...snowfallProps} /> */}
      <Stack direction={"column"}>
        <NavBar />
        <Routes>
          <Route path="/" element={<StartGame />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/game-over" element={<GameOver />} />
          <Route path="/login" element={<Login />} /> 
          <Route path="/signup" element={<Signup />} /> 
          <Route path='/game-history' element={<GameHistoryList/>} />
        </Routes>
      </Stack>
    </>
  );
}
export default App;
