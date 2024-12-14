import { useState, useEffect } from "react";
import {
  fetchRandomSong,
  fetchRandomTitles,
  fetchPosterById,
} from "../services/api";
import { Song } from "../components/MusicQuiz";
import { Poster } from "../components/MusicPoster";
import noPicture from "../assets/ts_placeholder.jpg";

export const useSong = (isToFetch: number) => {
  const [song, setSong] = useState<Song>({} as Song);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const data = await fetchRandomSong();
        if (data.song_title) {
          setSong(data);
        } else {
          fetchSong();
        }
      } catch (error) {
        console.error("Error fetching song data:", error);
      }
    };

    if (isToFetch) {
      fetchSong();
      setIsSoundLoaded(false);
      
    }
  }, [isToFetch]);

  return { song, isSoundLoaded, setIsSoundLoaded };
};

export const useOptions = (song: Song) => {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const randOptions: string[] = await fetchRandomTitles();
        const filteredOptions = randOptions
          .filter((option) => option !== song.song_title.title)
          .slice(0, randOptions.length - 1);
        const shuffledOptions = [
          ...filteredOptions,
          song.song_title.title,
        ].sort(() => Math.random() - 0.5);
        setOptions(shuffledOptions);
      } catch (error) {
        console.error("Error fetching options data:", error);
      }
    };

    fetchOptions();
  }, [song]);

  return options;
};

export const usePoster = (song: Song) => {
  const [poster, setPoster] = useState<Poster>({} as Poster);

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
        const response = await fetchPosterById(
          song.song_title.poster_pics[randomPosterId].toString()
        );
        setPoster(response.data);
      } catch (error) {
        console.error("Error fetching poster data:", error);
      }
    };

    fetchPoster();
  }, [song]);

  return poster;
};
