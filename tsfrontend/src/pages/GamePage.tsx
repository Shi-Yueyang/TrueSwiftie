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
    setCurrentTurn,
    nextTurn,
    setNextTurn,
    sound,
    setSound,
    nextSound,
    setNextSound,
  } = useContext(AppContext);
  const volume = 1;
  const [timeLimit, setTimeLimit] = useState(-1);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const [health, setHealth] = useState(3);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [bgLoaded, setBgLoaded] = useState(false);

  // fetch song, options, and poster
  // Using server-provided turn (currentTurn) instead of local random song logic now
  const currentSong = useSong(currentTurn?.song, "current");
  const nextSong = useSong(nextTurn?.song, "next");
  const options = currentTurn?.options || [];



  const handleNext = async () => {
    if (!gameSession) return;
    console.log("next");
    try {
      const data = await fetchNextTurn(gameSession.id, {
        version: gameSession.version,
      });
      setGameSession(data.session);
      setCurrentTurn(data.new_turn);
      setNextTurn(data.preloaded_turn);
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
    console.log("guess")
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


  console.log("cur", currentSong?.song_title.title, "|| nxt", nextSong?.song_title.title,"|| turn", currentTurn?.id);

  // current sound
  useEffect(() => {
        // Preload next sound in background
    const nextFile = nextSong?.file;
    if (nextFile) {

      console.log("preload next sound",nextSong?.song_title.title);
      const nextNewSound = new Howl({
        src: [nextFile],
        volume: 1,
        html5: true,
        preload: true,
        format: ["mp3"],
      });
      setNextSound(nextNewSound);
    }
    // clean up any existing sound instance only when switching to a different track
    const currentFile = currentSong?.file;
    if (!currentFile || !currentTurn) return;

    let disposed = false;
    let newSound: Howl;
    if (nextSound && gameSession?.score !== 0) {
      console.log("Using preloaded next sound");
      newSound = nextSound;
    } else if (!sound) {
      console.log("fetch new sound", currentSong);

      newSound = new Howl({
        src: [currentFile],
        volume: 1,
        html5: true,
        preload: true,
        format: ["mp3"],
      });
    } else {
      setIsSoundLoaded(sound.playing());
      console.log("disposed", disposed);
      return;
    }
    if (sound && (sound !== newSound || gameSession?.score === 0)) {
      sound.fade(volume, 0, 200);
      sound.stop();
      sound.unload();
      console.log("unloaded");
    }
    // Prepare time limit once per turn
    setTimeLimit(getTimeLimitForScore(gameSession?.score ?? 0));

    let skipTo = 0;
    // Mark UI ready when playback actually starts
    newSound.once("play", (id) => {
      if (disposed) {
        console.log("not play disposed");
        return;
      }
      console.log("playback started", id, newSound);
      setIsSoundLoaded(true);
      if (skipTo > 0) {
        newSound.seek(skipTo, id);
      }
    });

    // set load handler
    if (newSound.state() === "loaded") {
      if(sound === nextSound) {
        console.log("next sound === sound");
        return;
      }
      console.log("sound already loaded", newSound);
      // If loaded, call play directly
      newSound.play();
      if (gameSession && gameSession?.score >= 5) {
        const duration = newSound.duration();
        const maxSkip = Math.min(90, Math.max(0, duration - 1));
        if (Math.random() > 0.25) {
          skipTo = Math.random() * maxSkip;
        }
      }
    } else {
      console.log("song not loaded", newSound);

      newSound.once("load", () => {
        if (disposed) {
          console.log("not load disposed");
          return;
        }
        newSound.play();
        if (gameSession && gameSession?.score >= 5) {
          const duration = newSound.duration();
          const maxSkip = Math.min(90, Math.max(0, duration - 1));
          if (Math.random() > 0.25) {
            skipTo = Math.random() * maxSkip;
          }
        }
      });
    }

    // Handle autoplay restrictions or transient errors
    newSound.on("playerror", () => {
      newSound.once("unlock", () => newSound.play());
    });

    newSound.on("loaderror", (id, err) => {
      console.error("Howler loaderror", { id, err });
    });
    console.log("setsound", (newSound as any)._src);

    setSound(newSound);




    return () => {
      console.log("Disposed");
      // disposed = true;
    };
  }, [currentTurn?.id, currentSong?.file]);

  // Preload next sound in background
  useEffect(() => {

    // const nextFile = nextSong?.file;
    // if (!nextFile || !nextTurn) return;
    // if (isSameSrc(nextSound, nextFile)) return;
    // console.log("preload next sound");
    // const nextNewSound = new Howl({
    //   src: [nextFile],
    //   volume: 1,
    //   html5: true,
    //   preload: true,
    //   format: ["mp3"],
    // });
    // setNextSound(nextNewSound);
  }, [nextSong?.file, sound]); //bug

  // Guard: if not actively playing, redirect home (independent of sound lifecycle)
  useEffect(() => {
    if (
      !gameSession ||
      (gameSession.status !== "in_progress" &&
        gameSession.status !== "revealing")
    ) {
      if (gameSession?.status === "ended") {
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
      const url = `${backendIp.replace("api", "")}/${currentTurn.poster_url}`;
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
              transition:
                "filter 400ms ease, transform 400ms ease, opacity 400ms ease",
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
            <IoHeart
              key={index}
              style={{ color: "orange", fontSize: "20px" }}
            />
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
            key={currentSong?.song_title?.title || ""}
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
