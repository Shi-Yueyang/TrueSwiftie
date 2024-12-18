import React, { useContext } from "react";
import { motion } from "framer-motion";
import { Box, Button, Stack, Typography } from "@mui/material";
import { AppContext } from "../context/AppContext";

interface MusicDisplayProps {
    imageUrl:string;
  onButtonClick: () => void; // Callback to notify the parent
}

const MusicDisplay: React.FC<MusicDisplayProps> = ({
    imageUrl,
  onButtonClick,
}) => {
  const context = useContext(AppContext);
const {song} = context
  return (
    <Stack>
      <Typography
        variant="subtitle1"
        sx={{
          marginBottom: "10px",
          fontSize: "1rem",
          fontWeight: "bold",
          textAlign: "center",
          color: "#333",
        }}
      >
        {song?.song_title.title}
      </Typography>
      <Box
        sx={{
          position: "relative",
          width: 300,
          height: 300,
          margin: "auto",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Rotating Vinyl Record with Motion Effects */}
        <motion.img
          src={imageUrl}
          alt="Vinyl Record"
          initial={{ scale: 0, opacity: 0 }} // Enter effect: starts small and invisible
          animate={{ scale: 1, opacity: 1, rotate: 360 }} // Animation: scales up, becomes visible, and rotates
          exit={{ scale: 0, opacity: 0, rotate: 0 }} // Exit effect: fades out and shrinks
          transition={{
            scale: { duration: 0.5 }, // Scale animation duration
            opacity: { duration: 0.5 }, // Opacity animation duration
            rotate: { duration: 10, repeat: Infinity, ease: "linear" }, // Smooth infinite rotation
          }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        {/* Small Button */}
        <Button
          onClick={onButtonClick}
          sx={{
            position: "absolute",
            top: "10px",
            backgroundColor: "#fff",
            color: "#000",
            padding: "5px 10px",
            borderRadius: "15px",
            textTransform: "capitalize",
            zIndex: 2,
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          View Rankings
        </Button>
      </Box>
    </Stack>
  );
};

export default MusicDisplay;
