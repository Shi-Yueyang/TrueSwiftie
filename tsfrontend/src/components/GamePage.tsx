import { useContext, useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import { LinearProgress } from "@mui/material";
import { motion } from "framer-motion";
import { Howl } from "howler";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import MusicQuiz from "./MusicQuiz";
import MusicPoster from "./MusicPoster";
import { useSong,useOptions,usePoster } from "../hooks/hooks";

import "../styles/App.css";
import placeholderImg from "../assets/music_mark.png";

const GamePage = () => {
  const context = useContext(AppContext);
  const { setGameState, score, setScore, gameHistoryId, sound, setSound } =
    context;

  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const volume = 1;
  const [imgSource, setImgSource] = useState(placeholderImg);
  const [isToFetch, setIsToFetch] = useState(1);
  const [timeLimit, setTimeLimit] = useState(-1);

  const handleNext = () => {
    setIsToFetch(isToFetch + 1);
    setImgSource(placeholderImg);
  };

  const handleSelectCorrect = () => {
    setScore(score + 1);
    const historyData = {
      id: gameHistoryId,
      score: score + 1,
    };
    axios
      .patch(`${backendIp}/ts/game-histories/${gameHistoryId}/`, historyData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        setImgSource(poster.image);
      });
  };

  const handleSelectWrong = (lastChoice: string, correctOption: string) => {
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
        });
    }
  };

  const handleSoundOnPlay = () => {
    setIsSoundLoaded(true);
    if (score >= 30) {
      setTimeLimit(3);
    } else if (score >= 20) {
      setTimeLimit(5);
    } else if (score >= 10) {
      setTimeLimit(10);
    } else if (score >= 2) {
      setTimeLimit(13);
    }
  };
// 
  // fetch new song
  const { song, isSoundLoaded, setIsSoundLoaded } = useSong(isToFetch);
  const options = useOptions(song);
  const poster  = usePoster(song);


  // set sound
  useEffect(() => {
    const playNewSound = async () => {
      if (sound) {
        sound.fade(volume, 0, 1000);
        setTimeout(() => {
          sound.stop();
          sound.unload();
        }, 1000);
      }
      if (song.file) {
        const newSound = new Howl({
          src: [song.file],
          volume: 1,
          onend: handleNext,
          html5: true,
          onplay: handleSoundOnPlay,
        });
        setSound(newSound);
      }
    };
    playNewSound();
  }, [song]);

  useEffect(() => {
    if (sound) {
      sound.play();
      sound.fade(0, volume, 1000);
    }
  }, [sound]);

  return (
    <>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={3}
        style={{ height: "95vh" }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <MusicPoster imgSource={imgSource} score={score} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div
            key={song?.song_title?.title || ""}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1 }}
          >
            {isSoundLoaded ? (
              <MusicQuiz
                correctOption={song?.song_title?.title || ""}
                options={options}
                handleNext={handleNext}
                timeLimit={timeLimit}
                handleSelectCorrect={handleSelectCorrect}
                handleSelectWrong={handleSelectWrong}
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
