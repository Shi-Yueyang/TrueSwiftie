import { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/system";
import {  IoArrowForwardOutline, IoCheckmarkCircle } from "react-icons/io5"; //IoMusicalNotes
// import { TbChristmasTree } from "react-icons/tb";
import "../styles/App.css";
import { WiRaindrop } from "react-icons/wi";

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
            color={isPosterRevealed && option === correctOption ? "success" : "secondary"}
            aria-label={`Select option ${option}`}
            startIcon={isPosterRevealed && option === correctOption ? <IoCheckmarkCircle /> : <WiRaindrop />}
            onClick={() => onChoose(option)}
            disabled={isPosterRevealed}
            $highlight={isPosterRevealed && option === correctOption}
          >
            {option}
          </StyledButton>
        </Grid>
      ))}

      {isPosterRevealed && (
        <Button
          aria-label="Next"
          variant="contained"
          onClick={onClickNext}
          sx={{
            borderRadius: "999px",
            minWidth: 56,
            minHeight: 56,
            p: 1,
            backgroundColor: "rgba(255,255,255,0.78)",
            color: "#111",
            backdropFilter: "blur(6px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
          }}
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

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "$highlight",
})<{ $highlight?: boolean }>(({ theme, $highlight }) => ({
  borderRadius: "25px",
  padding: "12px",
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  "&.Mui-disabled": {
    transform: "none",
    boxShadow: $highlight ? "0 0 0 3px rgba(76,175,80,0.35), 0 6px 14px rgba(0,0,0,0.3)" : "none",
    opacity: $highlight ? 1 : 0.6,
    backgroundColor: $highlight ? theme.palette.success.main : undefined,
    color: $highlight ? theme.palette.success.contrastText : undefined,
  },
}));

export default MusicQuiz;
