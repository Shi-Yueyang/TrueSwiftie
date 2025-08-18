import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Container,
  Fade,
} from "@mui/material";
import { IoPlayCircle, IoPauseCircle } from "react-icons/io5";
import { useSong } from "../hooks/hooks";
import { AppContext } from "../context/AppContext";

interface MusicPlayerProps {
  songTitle: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songTitle }) => {
  const volume = 0.7;
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const context = useContext(AppContext);
  const { sound, setSound } = context;
  const song = useSong(songTitle);

  // set sound
  useEffect(() => {
    const setNewSound = async () => {
      if (sound) {
        sound.fade(volume, 0, 1000);
        sound.stop();
        sound.unload();
      }

      if (song) {
        const newSound = new Howl({
          src: [song.file],
          volume: volume,
          html5: true,
        });
        setSound(newSound);
        newSound.play();
      }
    };
	setIsPlaying(true);
    setNewSound();
}, [song]);

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

  return (
    <Fade in={Boolean(songTitle)}>
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
                title={songTitle}
                sx={{ minWidth: 0 }} // Allow text truncation
              >
                {songTitle}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            ></Box>
          </Box>
        </Container>
      </Paper>
    </Fade>
  );
};

export default MusicPlayer;
