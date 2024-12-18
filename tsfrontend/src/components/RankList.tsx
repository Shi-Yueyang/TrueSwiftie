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
import { GameHistory } from "./GameOver";
import { useState } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";

interface Props {
  scoreRank: GameHistory[];
}

const RankList = ({ scoreRank }: Props) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 3;
  const paginatedScoreRank = scoreRank.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const handleNextPage = () => {
    if ((page + 1) * rowsPerPage < scoreRank.length) {
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
        maxWidth: 600,
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
          {paginatedScoreRank.map((rank, index) => (
            <ListItem
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom:
                  index === paginatedScoreRank.length - 1
                    ? "none"
                    : "1px solid #ddd",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color:
                      index === 0
                        ? "#EFD700"
                        : index === 1
                        ? "#C0C0C0"
                        : index === 2
                        ? "#CD7F32"
                        : "#333",
                    fontSize: "1.2rem",
                    marginRight: "10px",
                  }}
                >
                  {index + 1}.
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "500",
                    color: "#333",
                    fontSize: "1.1rem",
                    marginRight: "20px", // Add margin to create space
                  }}
                >
                  {rank.player_name}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontWeight: "500",
                  color: "#333",
                  fontSize: "1.1rem",
                  marginLeft: "20px", // Add margin to create space
                }}
              >
                {rank.score}
              </Typography>
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
            }}
          >
            <IoArrowBack />
          </IconButton>
          <IconButton
            onClick={handleNextPage}
            disabled={(page + 1) * rowsPerPage >= scoreRank.length}
            sx={{
              borderRadius: "50%",
              backgroundColor: "#1976d2",
              color: "#fff",
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
