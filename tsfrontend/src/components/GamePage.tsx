import { useContext, useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import { LinearProgress, Box, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { Howl } from "howler";
import { fetchNextTurn } from "../services/api";
import { AppContext } from "../context/AppContext";
import MusicQuiz from "./MusicQuiz";
import { useRandomSong } from "../hooks/hooks";
import "../styles/App.css";
import placeholderImg from "../assets/music_mark.png";
import { useNavigate } from "react-router-dom";

const GamePage = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const {
    score,
    setScore,
    gameSessionId,
    sessionVersion,
    setSessionVersion,
    currentTurn,
    setCurrentTurn,
    sound,
    setSound,
    snowfallProps,
    setSnowfallProps,
    setGameState,
    gameState,
  } = context;
  const volume = 1;
  const [imgSource, setImgSource] = useState(placeholderImg);
  const [isRevealed, setIsRevealed] = useState(false);
  const [nextClickCnt] = useState(1); // retained for existing hook placeholder
  const [timeLimit, setTimeLimit] = useState(-1);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const [hasPlayedFirstSong, setHasPlayedFirstSong] = useState(false);

  const handleNextQuestionClicked = async () => {
    if (!gameSessionId) return;
    try {
      const data = await fetchNextTurn(gameSessionId, {
        version: sessionVersion,
      });
      setSessionVersion(data.session.version);
      setCurrentTurn(data.turn || null);
      setImgSource(placeholderImg);
      setIsSoundLoaded(false);
      setIsRevealed(false);
      if (data.ended) {
        setGameState("gameOver");
        navigate("/game-over", { replace: true });
      }
    } catch (e) {
      console.error("Next turn failed", e);
    }
  };

  const handleSelectIsCorrect = () => {
    // optimistic UI update; server will confirm via guess response
    setScore(score + 1);
    setSnowfallProps({
      ...snowfallProps,
      snowflakeCount: 150 + score * 5,
      wind: [-0.5 - score, 2.0 + score],
    });
  };

  const handleSelectIsWrong = (_lastChoice: string, _correctOption: string) => {
    // handled after guess response when outcome != correct
  };

  const handleSoundOnPlay = () => {
    console.log("handle on play, is sound loaded is ", isSoundLoaded);
    if (score >= 35) {
      setTimeLimit(5);
    } else if (score >= 20) {
      setTimeLimit(7);
    } else if (score >= 10) {
      setTimeLimit(10);
    } else if (score >= 2) {
      setTimeLimit(13);
    }
    setIsSoundLoaded(true);
  };

  // fetch song, options, and poster
  // Using server-provided turn (currentTurn) instead of local random song logic now
  const song = useRandomSong(nextClickCnt, undefined); // TODO: replace with server-provided song data fetch if needed
  const options = currentTurn?.options || [];

  // set sound
  useEffect(() => {
    // placeholder: original random sound logic retained until backend provides song file via turn
    if (!song) return;
    if (sound) {
      sound.fade(volume, 0, 300);
      sound.stop();
      sound.unload();
    }
    const newSound = new Howl({
      src: [song.file],
      volume: 1,
      html5: true,
      onend: handleNextQuestionClicked,
      onplay: handleSoundOnPlay,
    });
    setSound(newSound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn]);

  // play sound
  useEffect(() => {
    // guard: if not actively playing, redirect home
    if (gameState !== "playing") {
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
  }, [sound]);

  // Full-page background styles (fixed layer under content)
  const bgStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundImage: isRevealed && imgSource ? `url(${imgSource})` : "none",
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
    background: isRevealed ? "rgba(0,0,0,0.35)" : "transparent",
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
        <Chip color="primary" label={`Score: ${score}`} />
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
                correctOption={
                  "" /* correct withheld; component uses outcome logic */
                }
                options={options}
                handleNext={handleNextQuestionClicked}
                timeLimit={timeLimit}
                handleSelectCorrect={handleSelectIsCorrect}
                handleSelectWrong={handleSelectIsWrong}
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
