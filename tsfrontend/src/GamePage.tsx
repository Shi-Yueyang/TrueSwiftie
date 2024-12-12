import { useContext, useEffect, useRef, useState } from "react";
import MusicQuiz, { Song } from "./MusicQuiz";
import MusicPoster, { Poster } from "./MusicPoster";
import axios from "axios";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";
import { Howl } from "howler";
import "./App.css";
import placeholderImg from "./assets/music_mark.png";
import noPicture from "./assets/ts_placeholder.jpg";
import { AppContext } from "./AppContext";

const GamePage = () => {
  const context = useContext(AppContext);
  const { setGameState, score, setScore, gameHistoryId, sound, setSound } =
    context;

  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const volume = 1;
  const [options, setOptions] = useState<string[]>([]);
  const [song, setSong] = useState<Song>({} as Song);
  const [poster, setPoster] = useState<Poster>({} as Poster);
  const [imgSource, setImgSource] = useState(placeholderImg);
  const [isLoading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleNext = () => {
    setLoading(true);
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
    setScore(0);
  };

  // fetch new song
  useEffect(() => {
    const fetchSong = async () => {
      try {


        const response = await axios.get(`${backendIp}/ts/songs/random_song/`);
        const data = response.data;
        if (data.song_title) {
          setSong(response.data);
          setLoading(false);
        } else {
          fetchSong();
        }
      } catch (error) {
        console.error("Error fetching song data:", error);
        setLoading(false);
      }
    };
    if (isLoading) {
      fetchSong();
    }
  }, [isLoading]);

  // fetch options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const randOptions: string[] = (
          await axios.get(`${backendIp}/ts/random-titles/`)
        ).data;

        const filteredOptions = randOptions
          .filter((option) => option !== song.song_title.title)
          .slice(0, randOptions.length - 1);
        const shuffledOptions = [
          ...filteredOptions,
          song.song_title.title,
        ].sort(() => Math.random() - 0.5);
        setOptions(shuffledOptions);
      } catch (error) {
        console.error("Error fetching song data:", error);
      }
    };
    fetchOptions();
  }, [song]);

  // fetch poster
  useEffect(() => {
    const fetchPoster = async () => {
      try {
        if (song.song_title.poster_pics.length === 0) {
          setPoster({ poster_name: "none", image: noPicture });
          return;
        }
        const randomPosterId = Math.floor(
          Math.random() * song.song_title.poster_pics.length
        );
        const response = await axios.get(
          `${backendIp}/ts/posters/${song.song_title.poster_pics[randomPosterId]}/`
        );
        setPoster(response.data);
      } catch (error) {
        console.error("Error fetching poster data:", error);
      }
    };
    fetchPoster();
  }, [song]);

  // set sound
  useEffect(() => {
    const playNewSound = async () => {
      if (sound) {
        sound.fade(volume, 0, 1000);
        console.log("Fading out sound", sound);
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
        });
        console.log("New sound", newSound);
        setSound(newSound);
      }
    };
    playNewSound();
  }, [song]);

  useEffect(() => {
    if (sound) {
      console.log("Playing sound", sound);
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
            <MusicQuiz
              correctOption={song?.song_title?.title || ""}
              options={options}
              handleNext={handleNext}
              handleSelectCorrect={handleSelectCorrect}
              handleSelectWrong={handleSelectWrong}
            />
          </motion.div>
        </Grid>
      </Grid>
    </>
  );
};

export default GamePage;
