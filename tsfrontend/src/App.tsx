import { useEffect, useState } from 'react'
import MusicQuizComponent, { Poster, Song } from './MusicQuiz'

import './App.css'
import axios from 'axios';

function App() {

  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const [options, setOptions] = useState<string[]>([]);
  const [song,setSong] = useState<Song >({} as Song);
  const [poster,setPoster] = useState<Poster>({} as Poster);
  const [next,setNext] = useState(0);
  
  const handleNext = ()=>{setNext(next+1)}

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await axios.get(`${backendIp}/ts/songs/random_song/`);
        setSong(response.data);
      } catch (error) {
        console.error('Error fetching song data:', error);
      }
    }
    fetchSong();
  }, [next]);
  



  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const randOptions:string[] = (await axios.get(`${backendIp}/ts/random-titles/`)).data;
        
        const filteredOptions = randOptions
              .filter((option) => option !== song.song_title.title)
              .slice(0, randOptions.length - 1);
        const shuffledOptions =[...filteredOptions, song.song_title.title].sort(
          () => Math.random() - 0.5
        )
        setOptions(shuffledOptions);
      } catch (error) {
        console.error('Error fetching song data:', error);
      }
    };


    fetchOptions();
  }, [song]);

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const randomPosterId = Math.floor(Math.random() * song.song_title.poster_pics.length);
        const response = await axios.get(`${backendIp}/ts/posters/${song.song_title.poster_pics[randomPosterId]}/`);
        setPoster(response.data);
      }
      catch (error) {
        console.error('Error fetching poster data:', error);
      }
    }
    fetchPoster();
  },[song]);
  return (
    <>
      <MusicQuizComponent correctSong={song} options={options} handleNext={handleNext} poster={poster} />
    </>
  )
}

export default App
