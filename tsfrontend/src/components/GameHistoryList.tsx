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
} from "@mui/material";
import { styled } from "@mui/material/styles";

import Grid from "@mui/material/Grid2";
import { GameHistory } from "./GameOver";
import axios from "axios";
import { AuthContext } from "../context/AuthContex";
import { IoHeart } from "react-icons/io5";
import MusicPlayer from "./MusicPlayer";


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

const GameHistoryList: React.FC = () => {
  const pageSize = 13;
  const backendIp = import.meta.env.VITE_BACKEND_IP;
  const { userId } = useContext(AuthContext);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [selectedSong, setSelectedSong] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);



  const fetchTopScores = async (page: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendIp}/ts/game-histories/?user_id=${userId}&page=${page}`
      );
      setGameHistory(response.data.results);
      const count = response.data.count;
      const resultsPerPage = response.data.results.length || pageSize; // Default to 10 if no results
      setTotalPages(Math.ceil(count / resultsPerPage));
    } catch (error) {
      console.error("Error fetching top scores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopScores(currentPage);
  }, [currentPage, userId]);



  // Format the date string to a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };


  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Game History
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : gameHistory.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body1">You haven't palyed yet</Typography>
          </Paper>
        ) : (
          <>
            <List>
              {gameHistory.map((record) => (
                <StyledCard
                  key={record.id}
                  onClick={() => setSelectedSong(record.correct_choice)}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {formatDate(record.start_time)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography variant="body1">
                          <strong>Last Song:</strong> {record.correct_choice}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <ScoreBox score={record.score}>
                          Score: {record.score}
                        </ScoreBox>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography
                          variant="body1"
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <IoHeart /> <strong>{record.likes || 0}</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </StyledCard>
              ))}
            </List>
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_event, value) => setCurrentPage(value)}
                  color="primary"
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
          songTitle={selectedSong} 
        />
      )}
    </Container>
  );
};

export default GameHistoryList;
