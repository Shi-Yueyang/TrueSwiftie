import { useEffect, useState } from "react";
import MusicQuizComponent, { Poster, Song } from "./MusicQuiz";

import "./App.css";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { Howl, Howler } from "howler";

function App() {
  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const [options, setOptions] = useState<string[]>([]);
  const [song, setSong] = useState<Song>({} as Song);
  const [poster, setPoster] = useState<Poster>({} as Poster);
  const [next, setNext] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Howl | null>(null);

  // lick next
  const handleNext = () => {
    setNext(next + 1);
  };
  const fadeOutSound = (sound: Howl, duration: number) => {
    return new Promise<void>((resolve) => {
      sound.fade(sound.volume(), 0, duration);
      sound.once("fade", () => {
        sound.stop();
        resolve();
      });
    });
  };
  // fetch new song
  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await axios.get(`${backendIp}/ts/songs/random_song/`);
        const data = response.data;
        if(data.song_title){
          setSong(response.data);
          setLoading(false);
        }else{
          fetchSong();
        }
      } catch (error) {
        console.error("Error fetching song data:", error);
        setLoading(false);
      }
    };
    fetchSong();
  }, [next]);

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
        await fadeOutSound(sound, 1000); // Fade out over 1 second
      }

      const newSound = new Howl({
        src: [song.file],
        volume: 1,
        onend: handleNext,
      });

      setSound(newSound);
      console.log("Playing new sound");
      newSound.play();
    };

    playNewSound();
    return () => {
      if (sound) {
        sound.stop();
      }
    };
  }, [song]);

  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : (
        <MusicQuizComponent
          correctSong={song}
          options={options}
          handleNext={handleNext}
          poster={poster}
        />
      )}
    </>
  );
}

export default App;
