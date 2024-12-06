import { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/system";
import { IoMusicalNotes, IoArrowForwardOutline } from "react-icons/io5";
import placeholderImg from "./assets/grey.jpg"; // Step 1: Import the image
import { CSSTransition, TransitionGroup } from "react-transition-group";
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

export interface Poster {
  poster_name: string;
  image: string;
}

interface Props {
  correctSong: Song;
  poster: Poster;
  options: string[];
  handleNext: () => void;
}

const MusicQuizComponent = ({
  correctSong,
  options,
  poster,
  handleNext,
}: Props) => {
  const [isPosterRevealed, setRevealed] = useState(false);

  const onClickNext = () => {
    setRevealed(false);
    handleNext();
  };

  const onChoose = (option: string) => {
    if (option === correctSong.song_title.title) {
      setRevealed(true);
    }
  };

  return (
    <Paper
      key={Math.random()}
      elevation={3}
      sx={{
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        maxWidth: "600px",
        margin: "auto",
        marginTop: "40px",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        Guess
      </Typography>

      {correctSong && correctSong.song_title && (
        <ImageContainer>
          <StyledImage
            src={isPosterRevealed ? poster.image : placeholderImg}
            alt="Music Quiz"
            style={{ opacity: isPosterRevealed ? 1 : 0.5 }}
          />
        </ImageContainer>
      )}

      <Grid container spacing={2}>
        <TransitionGroup component={null}>
          {options.map((option, index) => (
            <CSSTransition key={index} timeout={300} classNames="fade">
              <Grid key={index}>
                <StyledButton
                  key={index}
                  variant="contained"
                  color="primary"
                  aria-label={`Select option ${option}`}
                  startIcon={<IoMusicalNotes />}
                  disabled={isPosterRevealed}
                  onClick={() => onChoose(option)}
                >
                  {option}
                </StyledButton>
              </Grid>
            </CSSTransition>
          ))}
        </TransitionGroup>

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
    </Paper>
  );
};

const ImageContainer = styled(Box)({
  width: "100%",
  paddingTop: "100%",
  position: "relative",
  borderRadius: "10px",
  overflow: "hidden",
  marginBottom: "20px",
  backgroundColor: "#f5f5f5",
});

const StyledImage = styled("img")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "opacity 0.3s ease",
});

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

export default MusicQuizComponent;
