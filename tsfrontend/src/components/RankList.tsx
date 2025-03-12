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
  gamehistories: GameHistory[];
}

const RankList = ({ gamehistories }: Props) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const gameRank = gamehistories.map(gamehistory=>{
    if(gamehistory.user.groups.length > 0 && gamehistory.user.groups.includes('formal')){
      return {
        name: gamehistory.user.username,
        score:gamehistory.score
      }
      
    }
    else{
      return {
        name: gamehistory.user.temporary_name+' (游客)',
        score:gamehistory.score
      }
    }
  })


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
          {gameRank
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
                <Box sx={{ display: "flex", alignItems: "center" }}>
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
                      marginRight: "10px",
                    }}
                  >
                    {index + 1 + page * rowsPerPage}.
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "500",
                      color: "#333",
                      fontSize: "1.1rem",
                      marginRight: "20px", // Add margin to create space
                    }}
                  >
                    {rank.name}
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
