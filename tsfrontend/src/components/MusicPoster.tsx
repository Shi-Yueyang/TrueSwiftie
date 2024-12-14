import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import "../styles/App.css";

interface Props {
  imgSource: string;
  score: number;
}

export interface Poster {
  poster_name: string;
  image: string;
}

const MusicPoster = ({ imgSource, score }: Props) => {
  console.log(imgSource);
  return (
    <Box
      sx={{
        width: "90%",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        position: "relative",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <motion.img
        key={imgSource}
        src={imgSource}
        alt="transitioning image"
        style={{ 
          width: "100%", 
          height: "300px", // Fixed height
          objectFit: "cover" // Maintain aspect ratio
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5 }} // Duration of transition
      />
      <Typography
        variant="body1"
        component="div"
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "#fff",
          padding: "5px 10px",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "1rem",
        }}
      >
        Score: {score}
      </Typography>
    </Box>
  );
};

export default MusicPoster;