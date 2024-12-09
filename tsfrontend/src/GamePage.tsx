import { useEffect, useState } from "react";
import MusicQuiz, { Song } from "./MusicQuiz";
import MusicPoster, { Poster } from "./MusicPoster";
import axios from "axios";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";
import { Howl } from "howler";
import "./App.css";
import placeholderImg from "./assets/music_mark.png";
import noPicture from "./assets/ts_placeholder.jpg";

interface Props {
  userName: string;
}

const GamePage = ({ userName }: Props) => {
  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const volume = 1;
  const [options, setOptions] = useState<string[]>([]);
  const [song, setSong] = useState<Song>({} as Song);
  const [poster, setPoster] = useState<Poster>({} as Poster);
  const [sound, setSound] = useState<Howl | null>(null);
  const [imgSource, setImgSource] = useState(placeholderImg);

  const [score, setScore] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const getChinaTime = () => {
    const date = new Date();
    const offset = 8 * 60; // China Standard Time is UTC+8
 
    const localTime = new Date(date.getTime() + offset * 60 * 1000);
    return localTime;
  };

  const handleNext = () => {
    setLoading(true);
    setImgSource(placeholderImg);
  };

  const handleSelectCorrect = () => {
    setScore(score + 1);
    setImgSource(poster.image);
  };

  const handleSelectWrong = () => {
    if (score > 0) {
      const historyData = {
        player_name: userName,
        score: score,
        timestamp: getChinaTime(),
      };
      axios.post(`${backendIp}/ts/game-histories/`, historyData, {
        headers: {
          "Content-Type": "application/json",
        },
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
        sound.fade(volume, 0, 1000); // Fade out over 1 second
        setTimeout(() => {
          sound.stop();
        }, 1000); // Stop the sound after the fade-out completes
      }
      const newSound = new Howl({
        src: [song.file],
        volume: 1,
        onend: handleNext,
        html5: true,
      });
      setSound(newSound);
      newSound.play();
      newSound.fade(0, volume, 1000);
    };

    playNewSound();
  }, [song]);

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
