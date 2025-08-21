import { useContext, useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import { LinearProgress, Box, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { Howl } from "howler";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import MusicQuiz from "./MusicQuiz";
import { useRandomSong, useOptions, usePoster } from "../hooks/hooks";
import "../styles/App.css";
import placeholderImg from "../assets/music_mark.png";
import { useNavigate } from "react-router-dom";

const GamePage = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const { score, setScore, gameHistoryId, sound, setSound,snowfallProps,setSnowfallProps, setGameState, gameState } = context;
  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const volume = 1;
  const [imgSource, setImgSource] = useState(placeholderImg);
  const [isRevealed, setIsRevealed] = useState(false);
  const [nextClickCnt, setNextClickCnt] = useState(1);
  const [timeLimit, setTimeLimit] = useState(-1);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const [hasPlayedFirstSong, setHasPlayedFirstSong] = useState(false);

  const handleNextQuestionClicked = () => {
    setNextClickCnt(nextClickCnt + 1);
    setImgSource(placeholderImg);
    setIsSoundLoaded(false);
  setIsRevealed(false);
  };

  const handleSelectIsCorrect = () => {
    setScore(score + 1);
    setSnowfallProps({
      ...snowfallProps,
      snowflakeCount: 150 + score * 5,
      wind: [-0.5 - score, 2.0 + score],
    });

    // Reveal poster in background immediately
    if (poster?.image) {
      setImgSource(poster.image);
      setIsRevealed(true);
    }

    const historyData = {
      id: gameHistoryId,
      score: score + 1,
    };
    axios.patch(
      `${backendIp}/ts/game-histories/${gameHistoryId}/`,
      historyData,
      { headers: { "Content-Type": "application/json" } }
    ).catch(() => {});
  };

  const handleSelectIsWrong = (lastChoice: string, correctOption: string) => {
    if (score > 0) {
      const historyData = {
        id: gameHistoryId,
        end_time: new Date().toISOString(),
        correct_choice: correctOption,
        last_choice: lastChoice,
      };
      axios
        .patch(
          `${backendIp}/ts/game-histories/${gameHistoryId}/`,
          historyData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then(() => {
          setGameState("gameOver");
          navigate("/game-over", { replace: true });
        })
        .catch((error) => {
          console.error(error);
          setGameState("gameOver");
          navigate("/game-over", { replace: true });
        });
    }
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
  const album =  undefined;
  const song = useRandomSong(nextClickCnt, album);
  const options = useOptions(song);
  const poster = usePoster(song);

  // set sound
  useEffect(() => {
    const setNewSound = async () => {
      if (sound) {
        // console.log("unload sound before set");
        sound.fade(volume, 0, 1000);
        sound.stop();
        sound.unload();
      }
      const startTime = Math.floor(Math.random() * 120);

      if (song) {
        const newSound = new Howl({
          src: [song.file],
          volume: 1,
          html5: true,
          onend: handleNextQuestionClicked,
          onplay: handleSoundOnPlay,
        });
        score > 1 && newSound.seek(startTime);
        setSound(newSound);
      }
    };
    setNewSound();
  }, [song]);

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
        style={{ minHeight: "100vh", position: "relative", zIndex: 1, padding: "1rem" }}
      >
        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <motion.div
            key={song?.song_title?.title || ""}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
          >
            {isSoundLoaded && song && options ? (
              <MusicQuiz
                correctOption={song.song_title.title}
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
