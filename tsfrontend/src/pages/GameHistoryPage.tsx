import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Pagination,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid2";
import { AuthContext } from "../context/AuthContex";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import MusicPlayer from "../components/MusicPlayer";
import {
  fetchPreviousSessionResults,
  PreviousSessionResults,
} from "../services/api";
import { Song } from "../components/MusicQuiz";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[4],
  },
}));

interface ScoreBoxProps {
  score: number;
}

const ScoreBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "score",
})<ScoreBoxProps>(({ theme, score }) => ({
  backgroundColor:
    score >= 50
      ? theme.palette.success.main
      : score >= 20
      ? theme.palette.info.main
      : theme.palette.warning.main,
  color: theme.palette.common.white,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  fontWeight: "bold",
  display: "inline-block",
}));

// New types for sessions

const GameHistoryPage: React.FC = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [previousResults, setPreviousResults] = useState<
    PreviousSessionResults[] | undefined
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // helper caches

  useEffect(() => {
    const fetchSessions = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetchPreviousSessionResults(page);
        setPreviousResults(response.results);

        setTotalPages(Math.ceil(response.count / 10));
      } catch (err: any) {
        console.error("Error fetching previous sessions:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load game history"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [userId, page]);

  const handleSelect = (song?: Song) => {
    console.log("Selected song:", song);
    if (song) setSelectedSong(song);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 3 }}>
        <IconButton aria-label="back to home" onClick={() => navigate('/') }>
          <IoArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Game History
        </Typography>
      </Box>

      <Box sx={{ py: 4, pb: selectedSong ? 12 : 4 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && error && (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}
        {!loading && !error && previousResults?.length === 0 && (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography>You haven't played yet</Typography>
          </Paper>
        )}
        {!loading &&
          !error &&
          previousResults &&
          previousResults.length > 0 && (
            <>
              <List>
                {previousResults.map((s) => (
                  <StyledCard
                    key={s.session_id}
                    onClick={() => handleSelect(s.last_correct_song)}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="body2">
                            {s.last_correct_song.song_title.title || "Unknown"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <ScoreBox score={s.score}>Score: {s.score}</ScoreBox>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </StyledCard>
                ))}
              </List>
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    page={page}
                    count={totalPages}
                    onChange={(_, v) => {
                      setPage(v);
                    }}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
      </Box>
      {selectedSong && (
        <MusicPlayer
          songId={selectedSong.id}
          songName={selectedSong.song_title.title}
        />
      )}
    </Container>
  );
};

export default GameHistoryPage;
