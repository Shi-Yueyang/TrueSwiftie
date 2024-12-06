import { Box } from "@mui/material";
import { motion } from "framer-motion";
import "./App.css";

interface Props {
  imgSource: string;
}
export interface Poster {
  poster_name: string;
  image: string;
}
const MusicPoster = ({ imgSource }: Props) => {
  return (
    <Box
      sx={{
        width: "90%",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
      }}
    >
      <motion.img
        src={imgSource}
        alt="transitioning image"
        style={{ width: "100%", height: "100%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }} // Duration of transition
      />
    </Box>
  );
};

export default MusicPoster;
