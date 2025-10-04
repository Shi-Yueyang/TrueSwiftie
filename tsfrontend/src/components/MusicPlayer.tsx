import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Container,
  Fade,
} from "@mui/material";
import {
  IoPlayCircle,
  IoPauseCircle,
  IoMusicalNotesOutline,
} from "react-icons/io5";
import { usePoster, useSong } from "../hooks/hooks";
import { AppContext } from "../context/AppContext";
import LyricDialogue from "./LyricDialogue";
import { Howl } from "howler";

interface MusicPlayerProps {
  songId: number;
  songName: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songId, songName }) => {
  const volume = 0.7;
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showLyrics, setShowLyrics] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // Progress percentage (0-100)

  const context = useContext(AppContext);
  const { sound, setSound } = context;
  const song = useSong(songId);
  const poster = usePoster(song);

  console.log("Rendering MusicPlayer with songId:", songId, "songName:", songName);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentTime = sound?.seek();
      const duration = sound?.duration();
      if (currentTime && duration) {
        const newProgress = (currentTime / duration) * 100;
        setProgress(newProgress);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [sound, progress]);

  // set sound
  useEffect(() => {
    let createdSound: Howl | null = null;

    const stopAndUnload = (s?: Howl | null) => {
      if (s) {
        try {
          s.fade(volume, 0, 300);
        } catch (_) {}
        s.stop();
        s.unload();
      }
    };

    // Always stop/unload any existing sound before starting a new one
    if (sound) {
      stopAndUnload(sound);
    }

    if (song) {
      const newSound = new Howl({
        src: [song.file],
        volume: volume,
        html5: true,
      });
      createdSound = newSound;
      setSound(newSound);
      newSound.play();
      setIsPlaying(true);
    }

    return () => {
      // Only clean up the sound created by this effect run
      if (createdSound) {
        stopAndUnload(createdSound);
        if (sound === createdSound) {
          setSound(null);
        }
      }
    };
  }, [song?.id]);

  const togglePlay = () => {
    if (sound) {
      if (isPlaying) {
        sound.pause();
      } else {
        sound.fade(0, volume, 1000);
        sound.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleShowLyrics = () => {
    setShowLyrics(true);
  };

  const handleCloseLyrics = () => {
    setShowLyrics(false);
  };


  return (
    <>
      <Fade in={Boolean(songName)}>
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 0,
            left: { xs: 0, md: 260 },
            right: 0,
            width: { xs: "100%", md: "calc(100% - 260px)" },
            py: 2,
            borderTopLeftRadius: { xs: 16, md: 0 },
            borderTopRightRadius: 16,
            backgroundColor: (theme) => theme.palette.background.paper,
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${progress}%`,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.primary.dark
                  : theme.palette.primary.light,
              opacity: 0.15,
              transition: "width 0.1s ease-out",
              zIndex: -1, // Behind the content
            }}
          />

          <Container maxWidth="lg">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              {/* Song info */}
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  minWidth: 0, // Prevent overflow
                }}
              >
                <IconButton onClick={togglePlay} color="primary">
                  {isPlaying ? (
                    <IoPauseCircle size={36} />
                  ) : (
                    <IoPlayCircle size={36} />
                  )}
                </IconButton>
                <Typography
                  variant={"body2"}
                  fontWeight="bold"
                  noWrap
                  title={songName}
                  sx={{
                    minWidth: 0,
                    cursor: "pointer",
                  }}
                >
                  {songName}
                </Typography>
              </Box>

              {/* Lyrics button */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <IconButton
                  onClick={handleShowLyrics}
                  color="primary"
                  title="Show lyrics"
                >
                  <IoMusicalNotesOutline size={24} />
                </IconButton>
              </Box>
            </Box>
          </Container>
        </Paper>
      </Fade>

      {/* Lyrics Dialog */}
      <LyricDialogue
        open={showLyrics}
        onClose={handleCloseLyrics}
        songName={songName}
        albumName={song?.song_title?.album}
        lyrics={song?.song_title?.lyrics || ""}
        posterImage={poster?.image}
      />
    </>
  );
};

export default MusicPlayer;
