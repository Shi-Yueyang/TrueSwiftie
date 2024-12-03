import { useEffect, useState } from 'react'
import MusicQuizComponent, { Song } from './MusicQuiz'

import './App.css'
import axios from 'axios';

function App() {


  const [options, setOptions] = useState<string[]>([]);
  const [song,setSong] = useState<Song >({} as Song);
  const [next,setNext] = useState(0);
  
  const handleNext = ()=>{setNext(next+1)}

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/ts/songs/random_song/');
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
        const randOptions:string[] = (await axios.get('http://127.0.0.1:8000/ts/random-titles/')).data;
        
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

  return (
    <>
      <MusicQuizComponent correctSong={song} options={options} handleNext={handleNext} />
    </>
  )
}

export default App
