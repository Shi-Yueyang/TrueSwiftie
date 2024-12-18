import { useState, useEffect, useContext } from "react";
import {
  fetchRandomSong,
  fetchRandomTitles,
  fetchPosterById,
} from "../services/api";
import { Song } from "../components/MusicQuiz";
import { Poster } from "../components/MusicPoster";
import noPicture from "../assets/ts_placeholder.jpg";
import { AppContext } from "../context/AppContext";


export const useRandomSong = (isToFetch: number) => {
  const context = useContext(AppContext);
  const {song,setSong} = context;

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
      
    }
  }, [isToFetch]);

  return song ;
};

export const useOptions = (song: Song|null) => {
  const [options, setOptions] = useState<string[]>();

  useEffect(() => {
    if(!song) return;
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

export const usePoster = (song: Song|null) => {
  const [poster, setPoster] = useState<Poster>();

  useEffect(() => {
    if (!song) return;
    const fetchPoster = async () => {
      try {
        if (song.song_title.poster_pics.length === 0) {
          setPoster({ poster_name: "none", image: noPicture });
          return;
        }
        const randomPosterId = Math.floor(
          Math.random() * song.song_title.poster_pics.length
        );
        const poster = await fetchPosterById(
          song.song_title.poster_pics[randomPosterId].toString()
        );
        setPoster(poster);
      } catch (error) {
        console.error("Error fetching poster data:", error);
      }
    };

    fetchPoster();
  }, [song]);

  return poster;
};

