import {
  List,
  ListItem,
  Card,
  CardContent,
  Typography,
  Box,
  CardHeader,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import {
  IoArrowBack,
  IoArrowForward,
  IoHeart,
  IoHeartOutline,
} from "react-icons/io5";
import axios from "axios";
import { GameHistory } from "../pages/GameOver";

interface Props {
  gamehistories: GameHistory[];
}

interface GameRank {
  id: number;
  name: string;
  score: number;
  likes: number;
  isLiked: boolean;
}
const RankList = ({ gamehistories }: Props) => {
  const [page, setPage] = useState(0);
  const [gameRanks, setGameRanks] = useState<GameRank[]>([]);
  const rowsPerPage = 5;
  const backendIp = import.meta.env.VITE_BACKEND_IP;

  useEffect(() => {
    setGameRanks(
      gamehistories.map((gamehistory) => ({
        id: gamehistory.id,
        name:
          gamehistory.user.groups &&
          gamehistory.user.groups.length > 0 &&
          gamehistory.user.groups.includes("formal")
            ? gamehistory.user.username
            : gamehistory.user.temporary_name + " (游客)",
        score: gamehistory.score,
        likes: gamehistory.likes,
        isLiked: false,
      }))
    );
  }, [gamehistories]);

  const handleLike = async (id: number) => {
    const oldLikes = gameRanks.find((rank) => rank.id === id)?.likes || 0;
    setGameRanks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            likes: item.likes + 1,
            isLiked: true,
          };
        }
        return item;
      })
    );
    try {
      await axios.patch(`${backendIp}/ts/game-histories/${id}/`, {
        id,
        likes: oldLikes + 1,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleNextPage = () => {
    if ((page + 1) * rowsPerPage < gamehistories.length) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };
  return (
    <Card
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        marginTop: "2rem",
        maxWidth: 1200,
        borderRadius: "16px",
        padding: "1rem",
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "bold",
              color: "#333",
              textAlign: "center",
            }}
          >
            Rankings
          </Typography>
        }
        sx={{ paddingBottom: 0 }}
      />
      <CardContent>
        <List sx={{ padding: 0 }}>
          {gameRanks
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((rank, index) => (
              <ListItem
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                }}
              >
                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ width: "100%" }}
                >
                  <Grid size={{ xs: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color:
                          index === 0 && page === 0
                            ? "#EFD700"
                            : index === 1 && page === 0
                            ? "#C0C0C0"
                            : index === 2 && page === 0
                            ? "#CD7F32"
                            : "#333",
                        fontSize: "1.2rem",
                        marginRight: "20px",
                      }}
                    >
                      {index + 1 + page * rowsPerPage}.
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }} margin={{ xs: "0 0 0 10px" }}>
                    <Typography
                      sx={{
                        fontWeight: "500",
                        color: "#333",
                        fontSize: "1.1rem",
                      }}
                    >
                      {rank.name}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 2 }}>
                    <Typography
                      sx={{
                        fontWeight: "500",
                        color: "#333",
                        fontSize: "1.1rem",
                      }}
                    >
                      {rank.score}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          padding: "2px",
                        }}
                        onClick={() => handleLike(rank.id)}
                        disabled={rank.isLiked}
                      >
                        {rank.isLiked ? (
                          <IoHeart color="#fe4444" />
                        ) : (
                          <IoHeartOutline />
                        )}
                      </IconButton>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          color: "#333",
                          fontSize: "0.9rem",
                          marginRight: "5px",
                        }}
                      >
                        {rank.likes}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
        </List>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
          }}
        >
          <IconButton
            onClick={handlePreviousPage}
            disabled={page === 0}
            sx={{
              borderRadius: "50%",
              backgroundColor: "#1976d2",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            <IoArrowBack />
          </IconButton>
          <IconButton
            onClick={handleNextPage}
            disabled={(page + 1) * rowsPerPage >= gamehistories.length}
            sx={{
              borderRadius: "50%",
              backgroundColor: "#1976a2",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            <IoArrowForward />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RankList;
