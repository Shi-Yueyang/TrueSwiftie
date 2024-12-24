import { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/system";
import {  IoArrowForwardOutline } from "react-icons/io5"; //IoMusicalNotes
import { TbChristmasTree } from "react-icons/tb";
import "../styles/App.css";

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
  timeLimit: number;
  handleNext: () => void;
  handleSelectCorrect: () => void;
  handleSelectWrong: (lastChoice: string, correctOption: string) => void;
}

const MusicQuiz = ({
  correctOption,
  options,
  handleNext,
  timeLimit,
  handleSelectCorrect,
  handleSelectWrong,
}: Props) => {
  const [isPosterRevealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1);
  const onClickNext = () => {
    setRevealed(false);
    handleNext();
  };
  useEffect(() => {
    setTimeLeft(timeLimit);
  }
  , [correctOption, timeLimit]);
  const onChoose = (option: string) => {
    if (option === correctOption) {
      handleSelectCorrect();
      setRevealed(true);
    } else {
      handleSelectWrong(option, correctOption);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (timeLeft > 0 && !isPosterRevealed) {
        setTimeLeft(timeLeft - 1);
        if (timeLeft === 1) {
          handleSelectWrong("Time's up", correctOption);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <Grid container spacing={2}>
      {options.map((option, index) => (
        <Grid key={index}>
          <StyledButton
            variant="contained"
            color="secondary"
            aria-label={`Select option ${option}`}
            startIcon={<TbChristmasTree  />}
            onClick={() => onChoose(option)}
            disabled={isPosterRevealed}
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
      {timeLimit > 0 && (
        <CircularProgress
          variant="determinate"
          value={(timeLeft / timeLimit) * 100}
        />
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
