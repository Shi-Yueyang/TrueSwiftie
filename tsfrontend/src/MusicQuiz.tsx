import { useState } from "react";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/system";
import { IoMusicalNotes, IoArrowForwardOutline } from "react-icons/io5";
import "./App.css";

interface SongTitle {
  title: string;
  album: string;
  lyrics: string;
  poster_pics: number[];
}

export interface Song {
  id: number;
  file: string;
  song_title: SongTitle;
}



interface Props {
  correctOption: string;
  options: string[];
  handleNext: () => void;
  handleSelectCorrect: () => void;
  handleSelectWrong: () => void;
}

const MusicQuiz = ({ correctOption, options, handleNext, handleSelectCorrect ,handleSelectWrong}: Props) => {
  const [isPosterRevealed, setRevealed] = useState(false);

  const onClickNext = () => {
    setRevealed(false);
    handleNext();
  };

  const onChoose = (option: string) => {
    if (option === correctOption) {
      handleSelectCorrect();
      setRevealed(true);
    }else{
      handleSelectWrong();
    }
  };

  return (

    <Grid container spacing={2}>
      {options.map((option, index) => (
        <Grid key={index}>
          <StyledButton
            variant="contained"
            color="primary"
            aria-label={`Select option ${option}`}
            startIcon={<IoMusicalNotes />}
            onClick={() => onChoose(option)}
          >
            {option}
          </StyledButton>
        </Grid>
      ))}

      {isPosterRevealed && (
        <Button
          variant="outlined"
          color="primary"
          style={{
            borderRadius: "50%",
            minWidth: "50px",
            minHeight: "50px",
            padding: "10px",
          }}
          onClick={onClickNext}
        >
          <IoArrowForwardOutline />
        </Button>
      )}
    </Grid>

  );
};

const StyledButton = styled(Button)({
  borderRadius: "25px",
  padding: "12px",
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
});

export default MusicQuiz;
