import { useContext, useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import { LinearProgress } from "@mui/material";
import { motion } from "framer-motion";
import { Howl } from "howler";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import MusicQuiz from "./MusicQuiz";
import MusicPoster from "./MusicPoster";
import { useRandomSong, useOptions, usePoster } from "../hooks/hooks";
import { fetchRandomSongStartFromTime, createBlobUrl } from "../services/api";
import "../styles/App.css";
import placeholderImg from "../assets/music_mark.png";

const GamePage = () => {
  const context = useContext(AppContext);
  const { setGameState, score, setScore, gameHistoryId, sound, setSound } =
    context;

  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const volume = 1;
  const [imgSource, setImgSource] = useState(placeholderImg);
  const [nextClickCnt, setNextClickCnt] = useState(1);
  const [timeLimit, setTimeLimit] = useState(-1);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);
  const [hasPlayedFirstSong, setHasPlayedFirstSong] = useState(false);
  const handleNextQuestionClicked = () => {
    setNextClickCnt(nextClickCnt + 1);
    setImgSource(placeholderImg);
  };

  const handleSelectIsCorrect = () => {
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
        poster && setImgSource(poster.image);
      });
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
        });
    }
  };

  const handleSoundOnPlay = () => {
    setIsSoundLoaded(true);
    if (score >= 35) {
      setTimeLimit(5);
    } else if (score >= 20) {
      setTimeLimit(7);
    } else if (score >= 10) {
      setTimeLimit(10);
    } else if (score >= 2) {
      setTimeLimit(13);
    }
  };

  // fetch song, options, and poster
  const song = useRandomSong(nextClickCnt);
  const options = useOptions(song);
  const poster = usePoster(song);

  // set sound
  useEffect(() => {
    const setNewSound = async () => {
      if (sound) {
        console.log("unload sound before set");
        sound.fade(volume, 0, 1000);
        sound.stop();
        sound.unload();
      }

      console.log("set sound:", song);
      if (song) {
        const startTime = Math.floor(Math.random() * 120);
        const arrayBuffer = await fetchRandomSongStartFromTime(
          song.file,
          startTime
        );
        const blobUrl = createBlobUrl(arrayBuffer, "audio/mpeg");
        const songSource = score >= 1 ? blobUrl : song.file;
        const newSound = new Howl({
          src: [songSource],
          volume: 1,
          onend: handleNextQuestionClicked,
          html5: true,
          onplay: handleSoundOnPlay,
        });
        setSound(newSound);
      }
    };
    setNewSound();
  }, [song]);

  // play sound
  useEffect(() => {
    if (sound) {
      console.log("play sound");
      sound.play();
      sound.fade(0, volume, 1000);
      // sound will be set twice during strict mode, so we need this
      setHasPlayedFirstSong(true); 
    }
    return () => {
      if (sound && !hasPlayedFirstSong) {
        console.log("unload sound during cleanup");
        sound.stop();
        sound.unload();
      }
    };
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
