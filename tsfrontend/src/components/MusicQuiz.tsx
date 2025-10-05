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
import LyricDialogue from "./LyricDialogue";
import { usePoster, useSong } from "../hooks/hooks";

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
}

const MusicQuiz = ({
  options,
  handleNext,
  timeLimit,
  handleGuess,
}: Props) => {
  const { gameSession, currentTurn } = useContext(AppContext);
  const [timeLeft, setTimeLeft] = useState(1);
  const [correctOption, setCorrectOption] = useState("");
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingOption, setSubmittingOption] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);

  // Fetch song/poster for lyrics display (same pattern as MusicPlayer)
  const song = useSong(currentTurn?.song as any);
  const poster = usePoster(song as any);
  const onClickNext = () => {
    handleNext();
  };


  const onClickOption = async (option: string) => {
    // If already answered, allow clicking the correct option to open lyrics
    if (currentTurn?.outcome !== "pending") {
      if (option === correctOption) setShowLyrics(true);
      return;
    }
    try {
      if (isSubmitting || currentTurn?.outcome !== "pending") return;
      setIsSubmitting(true);
      setSubmittingOption(option);
      const outcome = await handleGuess(option); // Await the async function
      console.log("Guess outcome:", outcome);
      if (outcome === "correct") {
        setCorrectOption(option);
      } else {
        setWrongOptions((prev) => [...prev, option]);
      }
      setIsSubmitting(false);
      setSubmittingOption(null);
    } catch (error) {
      console.error("Error handling guess:", error);
      setIsSubmitting(false);
      setSubmittingOption(null);
    }
  };

  useEffect(() => {
    setTimeLeft(timeLimit);
    // reset local UI state for a new question

    setIsSubmitting(false);
    setSubmittingOption(null);
    setShowLyrics(false);
  }, [options, timeLimit]);

  useEffect(() => {
    // Pause countdown while submitting a guess
    if (isSubmitting) return;
    const timer = setTimeout(() => {
      if (timeLeft > 0 && currentTurn?.outcome === "pending") {
        const next = timeLeft - 1;
        setTimeLeft(next);
        if (next === 0 && gameSession) {
          // On timeout, submit a guess and pause timer during the request
          (async () => {
            try {
              setIsSubmitting(true);
              setSubmittingOption("-timeout-");
              await handleGuess("-timeout-");
            } catch (e) {
              console.error("Timeout guess failed", e);
            } finally {
              setIsSubmitting(false);
              setSubmittingOption(null);
            }
          })();
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isSubmitting, currentTurn, gameSession, handleGuess]);

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
              isSubmitting && submittingOption === option ? (
                <CircularProgress size={18} color="inherit" />
              ) : currentTurn?.outcome === "correct" && option === correctOption ? (
                <IoCheckmarkCircle />
              ) : (
                <WiRaindrop />
              )
            }
            onClick={() => onClickOption(option)}
            disabled={
              isSubmitting ||
              (currentTurn?.outcome !== "pending" && option !== correctOption) ||
              wrongOptions.includes(option)
            }
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

      {/* Lyrics Dialog (reused from MusicPlayer) */}
      <LyricDialogue
        open={showLyrics}
        onClose={() => setShowLyrics(false)}
        songName={song?.song_title?.title || ""}
        albumName={song?.song_title?.album}
        lyrics={song?.song_title?.lyrics || ""}
        posterImage={poster?.image}
      />
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
