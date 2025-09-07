import React from "react";
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

interface TopPlayer {
  id: number;
  username: string;
  score: number;
  rank: number;
  avatar?: string;
}

// Mock data for top single game scores this week
const mockTopPlayers: TopPlayer[] = [
  {
    id: 1,
    username: "SwiftieQueen13",
    score: 1850,
    rank: 1,
    avatar: "🏆",
  },
  {
    id: 2,
    username: "TaylorFan22",
    score: 1720,
    rank: 2,
    avatar: "🌟",
  },
  {
    id: 3,
    username: "RedLover89",
    score: 1680,
    rank: 3,
    avatar: "💫",
  },
  {
    id: 4,
    username: "FolkloreVibes",
    score: 1620,
    rank: 4,
    avatar: "🍂",
  },
  {
    id: 5,
    username: "MidnightMaster",
    score: 1580,
    rank: 5,
    avatar: "🌙",
  },
  {
    id: 6,
    username: "ErasTourer",
    score: 1540,
    rank: 6,
    avatar: "✨",
  },
  {
    id: 7,
    username: "Reputation13",
    score: 1490,
    rank: 7,
    avatar: "🐍",
  },
  {
    id: 8,
    username: "LoverHeart",
    score: 1450,
    rank: 8,
    avatar: "💖",
  },
  {
    id: 9,
    username: "SpeakNowFan",
    score: 1420,
    rank: 9,
    avatar: "💜",
  },
  {
    id: 10,
    username: "FearlessSwiftie",
    score: 1380,
    rank: 10,
    avatar: "🎸",
  },
];

const TopPlayers: React.FC = () => {
  const navigate = useNavigate();

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
            {mockTopPlayers.map((player) => (
              <Grid size={12} key={player.id}>
                <Card
                  sx={{
                    borderRadius: "15px",
                    boxShadow: player.rank <= 3 ? "0px 6px 20px rgba(0, 0, 0, 0.15)" : "0px 2px 8px rgba(0, 0, 0, 0.1)",
                    border: player.rank <= 3 ? `2px solid ${getRankColor(player.rank)}` : "none",
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
                            backgroundColor: player.rank <= 3 ? getRankColor(player.rank) : "#f0f0f0",
                            color: player.rank <= 3 ? "white" : "#666",
                            fontWeight: "bold",
                            fontSize: { xs: "1rem", sm: "1.2rem" },
                          }}
                        >
                          {player.rank}
                        </Box>
                      </Grid>

                      {/* Avatar */}
                      <Grid>
                        <Avatar
                          sx={{
                            width: { xs: 40, sm: 50 },
                            height: { xs: 40, sm: 50 },
                            fontSize: { xs: "1.2rem", sm: "1.5rem" },
                            backgroundColor: "#f0f0f0",
                          }}
                        >
                          {player.avatar}
                        </Avatar>
                      </Grid>

                      {/* Player Info and Score */}
                      <Grid size="grow" container direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "center", sm: "flex-start" }} justifyContent={{ sm: "space-between" }} spacing={{ xs: 1, sm: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: "600",
                            color: "#111",
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                          }}
                        >
                          {player.username}
                        </Typography>
                        <Chip
                          label={`${player.score.toLocaleString()} pts`}
                          sx={{
                            backgroundColor: player.rank <= 3 ? getRankColor(player.rank) : "#e0e0e0",
                            color: player.rank <= 3 ? "white" : "#666",
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
            ))}
          </Grid>

        </Grid>
      </Grid>
    </Box>
  );
};

export default TopPlayers;
