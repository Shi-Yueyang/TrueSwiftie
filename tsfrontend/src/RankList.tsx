import { List, ListItem, Card, CardContent, Typography, Box, CardHeader } from "@mui/material";
import { GameHistory } from "./GameOver";



interface Props {
  scoreRank: GameHistory[];
}

const RankList = ({ scoreRank }: Props) => {
  return (
    <Card
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        marginTop: "2rem",
        maxWidth: 400,
        borderRadius: "16px",
        padding: "1rem",
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
      }}
    >
      <CardHeader>
        <Typography>
          Rank List
        </Typography>
      </CardHeader>
      <CardContent>

        <List sx={{ padding: 0 }}>
          {scoreRank.map((rank, index) => (
            <ListItem
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: index === scoreRank.length - 1 ? "none" : "1px solid #ddd",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: index === 0 ? "#EFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#333",
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
                }}
              >
                {rank.score}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RankList;
