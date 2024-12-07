import { useEffect, useState } from "react";
import MusicQuizComponent, { Song } from "./MusicQuiz";
import MusicPoster, { Poster } from "./MusicPoster";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";
import { Howl } from "howler";
import "./App.css";
import placeholderImg from "./assets/grey.jpg";

function App() {
  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const [options, setOptions] = useState<string[]>([]);
  const [song, setSong] = useState<Song>({} as Song);
  const [poster, setPoster] = useState<Poster>({} as Poster);
  const [sound, setSound] = useState<Howl | null>(null);
  const [imgSource, setImgSource] = useState(placeholderImg);

  const [score, setScore] = useState(0);
  const [isLoading, setLoading] = useState(true);
  
  const handleNext = () => {
    setLoading(true);
    setScore(score + 1);
    setImgSource(placeholderImg);
  };

  const handleSelectCorrect = () => {
    setImgSource(poster.image);
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
    fetchSong();
  }, [score]);

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
        sound.fade(1, 0, 1000); // Fade out over 1 second
        setTimeout(() => {
          sound.stop();
        }, 1000); // Stop the sound after the fade-out completes
      }
      const newSound = new Howl({
        src: [song.file],
        volume: 1,
        onend: handleNext,
      });
      setSound(newSound);
      newSound.play();
      newSound.fade(0, 1, 1000);
    };

    playNewSound();
  }, [song]);

  return (
    <>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          spacing={3}
          style={{ height: "95vh" }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <MusicPoster imgSource={imgSource} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              key={song.song_title.title} // Ensure the motion div re-renders with a unique key
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1 }}
            >
              <MusicQuizComponent
                correctOption={song.song_title.title}
                options={options}
                handleNext={handleNext}
                handleSelectCorrect={handleSelectCorrect}
              />
            </motion.div>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default App;
