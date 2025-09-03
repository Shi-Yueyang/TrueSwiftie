import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

import { Button, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/system";
import {
  IoArrowForwardOutline,
  IoCheckmarkCircle,
} from "react-icons/io5"; //IoMusicalNotes
// import { TbChristmasTree } from "react-icons/tb";
import "../styles/App.css";
import { WiRaindrop } from "react-icons/wi";

export interface SongTitle {
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
  options: string[];
  timeLimit: number;
  handleNext: () => void;
  handleGuess: (userGuess: string) => Promise<string | undefined>;
  handleTimeout: () => void;
}

const MusicQuiz = ({
  options,
  handleNext,
  timeLimit,
  handleGuess,
  handleTimeout,
}: Props) => {
  const { gameSession, currentTurn } = useContext(AppContext);
  const [timeLeft, setTimeLeft] = useState(1);
  const [correctOption, setCorrectOption] = useState("");
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const onClickNext = () => {
    handleNext();
  };
  const onClickOption = async (option: string) => {
    try {
      const outcome = await handleGuess(option); // Await the async function
      if (outcome === "correct") {
        setCorrectOption(option);
      } else {
        setWrongOptions((prev) => [...prev, option]);
      }
    } catch (error) {
      console.error("Error handling guess:", error);
    }
  };

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [options, timeLimit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (timeLeft > 0 && currentTurn?.outcome === "pending") {
        setTimeLeft(timeLeft - 1);
        if (timeLeft === 1 && gameSession) {
          handleTimeout();
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
            color={
              currentTurn?.outcome === "correct" && option === correctOption
                ? "success"
                : "primary"
            }
            aria-label={`Select option ${option}`}
            startIcon={
              currentTurn?.outcome === "correct" && option === correctOption ? (
                <IoCheckmarkCircle />
              ) : (
                <WiRaindrop />
              )
            }
            onClick={() => onClickOption(option)}
            disabled={currentTurn?.outcome !== "pending" || wrongOptions.includes(option)}
            $highlight={
              currentTurn?.outcome === "correct" && option === correctOption
            }
          >
            {option}
          </StyledButton>
        </Grid>
      ))}

      {currentTurn?.outcome === "correct" && (
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
    boxShadow: $highlight
      ? "0 0 0 3px rgba(76,175,80,0.35), 0 6px 14px rgba(0,0,0,0.3)"
      : "none",
    opacity: $highlight ? 1 : 0.6,
    backgroundColor: $highlight ? theme.palette.success.main : undefined,
    color: $highlight ? theme.palette.success.contrastText : undefined,
  },
}));

export default MusicQuiz;
