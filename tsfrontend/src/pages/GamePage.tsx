import { useContext, useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import { LinearProgress, Box, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { Howl } from "howler";
import { IoHeart } from "react-icons/io5";
import { endGameSession, fetchNextTurn } from "../services/api";
import { AppContext } from "../context/AppContext";
import MusicQuiz from "../components/MusicQuiz";
import { useSong } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";
const backendIp = import.meta.env.VITE_BACKEND_IP;

import "../styles/App.css";

import { submitGuess } from "../services/api";

const GamePage = () => {
  const navigate = useNavigate();
  const {
    gameSession,
    setGameSession,
    currentTurn,
    sound,
    setSound,
    setCurrentTurn,
  } = useContext(AppContext);
  const volume = 1;
  const [timeLimit, setTimeLimit] = useState(-1);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const [hasPlayedFirstSong, setHasPlayedFirstSong] = useState(false);
  const [health, setHealth] = useState(3);

  const handleNext = async () => {
    if (!gameSession) return;
    try {
      const data = await fetchNextTurn(gameSession.id, {
        version: gameSession.version,
      });
      setGameSession(data.session);
      setCurrentTurn(data.new_turn);
      setIsSoundLoaded(false);
    } catch (e) {
      console.error("Next turn failed", e);
    }
  };

  const handleSoundOnPlay = () => {
    if (!gameSession) return;
    if (gameSession.score >= 35) {
      setTimeLimit(5);
    } else if (gameSession.score >= 20) {
      setTimeLimit(7);
    } else if (gameSession.score >= 10) {
      setTimeLimit(10);
    } else if (gameSession.score >= 2) {
      setTimeLimit(13);
    }
    setIsSoundLoaded(true);
  };

  const handleGuess = async (userGuess: string) => {
    if (!gameSession || !currentTurn) return;

    const payload = {
      turn_id: currentTurn.id,
      option: userGuess,
      version: gameSession.version,
      elapsed_time_ms: 0,
    };

    try {
      const result = await submitGuess(gameSession.id, payload);
      setGameSession(result.session);
      setCurrentTurn(result.turn);
      setHealth(result.session.health);
      if (result.session.status === "ended") {
        navigate("/game-over");
      }
      return result.turn.outcome;
    } catch (error) {
      console.error("Error submitting guess:", error);
    }
  };

  const handleTimeout = async()=>{
    if(gameSession){
      endGameSession(gameSession.id, { version: gameSession.version });
      navigate("/game-over")
    }      
  }

const handleEnd =  () => {
  console.log("song end")
}
  // fetch song, options, and poster
  // Using server-provided turn (currentTurn) instead of local random song logic now
  const song = useSong(currentTurn?.song);
  const options = currentTurn?.options || [];
  console.log("song", song);
  // set sound
  useEffect(() => {
    if (!song) return;
    // clean up any existing sound instance
    if (sound) {
      sound.fade(volume, 0, 300);
      sound.stop();
      sound.unload();
    }
    const newSound = new Howl({
      src: [song.file],
      volume: 1,
      html5: true,
      onend: handleEnd,
      onplay: handleSoundOnPlay,
    });
    setSound(newSound);
    // Only re-run when the concrete audio file changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song]);

  // play sound
  useEffect(() => {
    // guard: if not actively playing, redirect home
    if (
      !gameSession ||
      (gameSession.status !== "in_progress" &&
        gameSession.status !== "revealing")
    ) {
      navigate("/", { replace: true });
      return;
    }
    if (sound) {
      sound.play();
      // sound will be set twice during strict mode, so we need this
      setHasPlayedFirstSong(true);
    }
    return () => {
      if (sound && !hasPlayedFirstSong) {
        // console.log("unload sound during cleanup");
        sound.stop();
        sound.unload();
      }
    };
  }, [sound, navigate, hasPlayedFirstSong]);
  console.log("currentTurn", currentTurn?.poster_url, currentTurn?.outcome);
  // Full-page background styles (fixed layer under content)
  const bgStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundImage:
      currentTurn?.outcome === "correct"
        ? `url(${backendIp}/${currentTurn?.poster_url})`
        : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    transition: "background-image 300ms ease-in-out",
    zIndex: 0,
    pointerEvents: "none",
  };
  const bgOverlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background:
      currentTurn?.outcome === "correct" ? "rgba(0,0,0,0.35)" : "transparent",
    zIndex: 0,
    pointerEvents: "none",
  };

  return (
    <>
      {/* Full-viewport background under content */}
      <div style={bgStyle} />
      <div style={bgOverlayStyle} />

      {/* Score overlay (fixed) */}
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 2 }}>
        <Chip color="primary" label={`Score: ${gameSession?.score}`} />
      </Box>

      {/* Health overlay (fixed) */}
      <Box sx={{ position: "fixed", top: 16, left: 16, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 12px', borderRadius: '20px' }}>
          <span style={{ fontWeight: 'bold' }}>Health: </span>
          {Array.from({ length: health }, (_, index) => (
            <IoHeart key={index} style={{ color: 'red', fontSize: '20px' }} />
          ))}
        </div>
      </Box>

      {/* Foreground content */}
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
          padding: "1rem",
        }}
      >
        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <motion.div
            key={song?.song_title?.title || ""}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
          >
            {isSoundLoaded && currentTurn && options.length > 0 ? (
              <MusicQuiz
                options={options}
                handleNext={handleNext}
                timeLimit={timeLimit}
                handleGuess={handleGuess}
                handleTimeout={handleTimeout}
              />
            ) : (
              <div>
                <div>Loading...</div>
                <LinearProgress />
              </div>
            )}
          </motion.div>
        </Grid>
      </Grid>
    </>
  );
};

export default GamePage;
