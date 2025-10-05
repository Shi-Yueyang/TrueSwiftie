import { useContext, useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import { LinearProgress, Box, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { Howl } from "howler";
import { IoHeart } from "react-icons/io5";
import { fetchNextTurn } from "../services/api";
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
  const [health, setHealth] = useState(3);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [bgLoaded, setBgLoaded] = useState(false);

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

  // Compute time limit based on score
  const getTimeLimitForScore = (score: number) => {
    if (score >= 35) return 5;
    if (score >= 20) return 7;
    if (score >= 10) return 10;
    if (score >= 2) return 13;
    return -1;
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

  const handleEnd = () => {
    console.log("song end");
  };
  // fetch song, options, and poster
  // Using server-provided turn (currentTurn) instead of local random song logic now
  const song = useSong(currentTurn?.song);
  const options = currentTurn?.options || [];
  // Create and manage Howl for the current song in a single effect
  useEffect(() => {
    const file = song?.file;
    if (!file || !currentTurn) return;

    // reset UI while switching tracks
    setIsSoundLoaded(false);

    // clean up any existing sound instance only when switching to a different track
    if (sound) {
      sound.fade(volume, 0, 200);
      sound.stop();
      sound.unload();
    }

    let disposed = false;
    const newSound = new Howl({
      src: [file],
      volume: 1,
      html5: true,  
      preload: true,
      onend: handleEnd,
      format: ["mp3"],
    });

    // Prepare time limit once per turn
    setTimeLimit(getTimeLimitForScore(gameSession?.score ?? 0));

    newSound.once("load", () => {
      if (disposed) return;
      newSound.play();
    });

    // Mark UI ready when playback actually starts
    newSound.once("play", () => {
      if (disposed) return;
      setIsSoundLoaded(true);
    });

    // Handle autoplay restrictions or transient errors
    newSound.on("playerror", () => {
      newSound.once("unlock", () => newSound.play());
    });

    newSound.on("loaderror", (id, err) => {
      console.error("Howler loaderror", { id, err, src: file });
    });

    console.log("new sound", newSound);
    setSound(newSound);

    return () => {
      disposed = true;
    };

  }, [currentTurn?.id, song?.file]);

  // Guard: if not actively playing, redirect home (independent of sound lifecycle)
  useEffect(() => {
    if (
      !gameSession ||
      (gameSession.status !== "in_progress" &&
        gameSession.status !== "revealing") 
    ) {
      if(gameSession?.status === "ended"){
        navigate("/game-over", { replace: true });
        return;
      }
      navigate("/", { replace: true });
    }
  }, [gameSession, navigate]);

  
  // Full-page background styles (fixed layer under content)
  const bgStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    overflow: "hidden",
  };
  
  const bgOverlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background:
      currentTurn?.outcome === "correct" ? "rgba(0,0,0,0.35)" : "transparent",
    zIndex: 0,
    pointerEvents: "none",
  };

  // Update background image URL when a correct answer is revealed
  useEffect(() => {
    if (currentTurn?.outcome === "correct" && currentTurn?.poster_url) {
      const url = `${backendIp.replace('api', '')}/${currentTurn.poster_url}`;
      setBgUrl(url);
      setBgLoaded(false);
    } else {
      setBgUrl(null);
      setBgLoaded(false);
    }
  }, [currentTurn?.outcome, currentTurn?.poster_url]);

  return (
    <>
      {/* Full-viewport background under content */}
      <div style={bgStyle}>
        {bgUrl && (
          <img
            src={bgUrl}
            alt=""
            loading="lazy"
            onLoad={() => setBgLoaded(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: bgLoaded ? "blur(0px)" : "blur(18px)",
              transform: bgLoaded ? "scale(1)" : "scale(1.05)",
              opacity: bgLoaded ? 1 : 0.6,
              transition: "filter 400ms ease, transform 400ms ease, opacity 400ms ease",
            }}
          />
        )}
      </div>
      <div style={bgOverlayStyle} />

      {/* Score overlay (fixed) */}
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 2 }}>
        <Chip color="primary" label={`Score: ${gameSession?.score}`} />
      </Box>

      {/* Health overlay (fixed) */}
      <Box sx={{ position: "fixed", top: 16, left: 16, zIndex: 2 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "8px 12px",
            borderRadius: "20px",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Health: </span>
          {Array.from({ length: health }, (_, index) => (
            <IoHeart key={index} style={{ color: "orange", fontSize: "20px" }} />
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
            transition={{ duration: 1 }}
          >
            {isSoundLoaded && currentTurn && options.length > 0 ? (
              <MusicQuiz
                options={options}
                handleNext={handleNext}
                timeLimit={timeLimit}
                handleGuess={handleGuess}
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
