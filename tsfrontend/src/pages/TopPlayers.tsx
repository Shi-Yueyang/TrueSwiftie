import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Box,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import "@fontsource/poppins";
import { IoArrowBack } from "react-icons/io5";
import { fetchTopWeekScore, TopWeekScore } from "../services/api";


const backendIp = import.meta.env.VITE_BACKEND_IP;

// Mock data for top single game scores this week


const TopPlayers: React.FC = () => {
  const navigate = useNavigate();
  const [topWeekScores,setTopWeekScores] = useState<TopWeekScore[]|null>(null);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return "#666";
    }
  };

  useEffect(()=>{
    const fetchScores = async ()=>{
      const scores = await fetchTopWeekScore();
      setTopWeekScores(scores);
    }
    fetchScores();
  },[])
  return (
    <Box
      sx={{
        minHeight: "95vh",
        padding: { xs: "1rem", sm: "1.5rem", md: "2rem" },
      }}
    >
      <Grid container justifyContent="center">
        <Grid size={{ xs: 12, sm: 10, md: 8, lg: 6 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 3, md: 4 } }}>
            <IconButton aria-label="back to home" onClick={() => navigate('/')}>
              <IoArrowBack />
            </IconButton>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "bold",
                color: "text.primary",
                letterSpacing: "2px",
                mb: 1,
                fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
              }}
            >
              Top Swifties
            </Typography>
          </Box>

          {/* Top Players List */}
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            {topWeekScores && topWeekScores.length === 0 && (
              <Grid size={12}>
                <Card
                  sx={{
                    borderRadius: "15px",
                    border: 1,
                    borderColor: "divider",
                    boxShadow: "none",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ textAlign: "center" }}
                    >
                      No games were played in the past week. Be the first to climb the leaderboard!
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            {topWeekScores?.map((playerScore, idx) => {
              const rank = idx + 1;
              const user = playerScore.user;
              return (
                <Grid size={12} key={`${user.id}-${idx}`}>
                  <Card
                    sx={{
                      borderRadius: "15px",
                      boxShadow:
                        rank <= 3
                          ? "0px 6px 20px rgba(0, 0, 0, 0.15)"
                          : "0px 2px 8px rgba(0, 0, 0, 0.1)",
                      border: rank <= 3 ? `2px solid ${getRankColor(rank)}` : "none",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <CardContent sx={{ padding: { xs: "12px", sm: "16px" } }}>
                      <Grid container alignItems="center" spacing={{ xs: 1, sm: 2 }}>
                        {/* Rank */}
                        <Grid>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: { xs: 40, sm: 50 },
                              height: { xs: 40, sm: 50 },
                              borderRadius: "50%",
                              backgroundColor: rank <= 3 ? getRankColor(rank) : "#f0f0f0",
                              color: rank <= 3 ? "white" : "#666",
                              fontWeight: "bold",
                              fontSize: { xs: "1rem", sm: "1.2rem" },
                            }}
                          >
                            {rank}
                          </Box>
                        </Grid>

                        {/* Avatar */}
                        <Grid>
                          <Avatar
                            src={`${backendIp}/${user.avatar}`}
                            alt={user.username}
                            sx={{
                              width: { xs: 40, sm: 50 },
                              height: { xs: 40, sm: 50 },
                              fontSize: { xs: "1.2rem", sm: "1.5rem" },
                              backgroundColor: "#f0f0f0",
                            }}
                          >
                            {(user.username || "?").charAt(0).toUpperCase()}
                          </Avatar>
                        </Grid>

                        {/* Player Info and Score */}
                        <Grid
                          size="grow"
                          container
                          direction={{ xs: "column", sm: "row" }}
                          alignItems={{ xs: "center", sm: "flex-start" }}
                          justifyContent={{ sm: "space-between" }}
                          spacing={{ xs: 1, sm: 0 }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: "600",
                              color: "#111",
                              fontSize: { xs: "1rem", sm: "1.25rem" },
                            }}
                          >
                            {user.username}
                          </Typography>
                          <Chip
                            label={`${playerScore.score.toLocaleString()} pts`}
                            sx={{
                              backgroundColor: rank <= 3 ? getRankColor(rank) : "#e0e0e0",
                              color: rank <= 3 ? "white" : "#666",
                              fontWeight: "bold",
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: { xs: "0.75rem", sm: "0.9rem" },
                              minWidth: { xs: "80px", sm: "100px" },
                              height: { xs: "28px", sm: "32px" },
                              textAlign: "right",
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

        </Grid>
      </Grid>
    </Box>
  );
};

export default TopPlayers;
