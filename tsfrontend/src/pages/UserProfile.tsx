import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import Avatar from "@mui/material/Avatar";
import { AuthContext } from "../context/AuthContex";
import { IoPencil, IoTrophy } from "react-icons/io5";
import { fetchTotalGamesPlayed } from "../services/api";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { userName, avatar, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  console.log("Avatar URL:", avatar);
  const [totalPlayed, setTotalPlayed] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchTotalGamesPlayed()
      .then((n) => {
        if (mounted) setTotalPlayed(n);
      })
      .catch(() => {
        if (mounted) setTotalPlayed(0);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [{ label: "游玩次数", value: totalPlayed ?? "-", icon: <IoTrophy /> }];

  // Achievements will be added in a future update

  return (
    <Box sx={{ minHeight: "100vh", py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <Avatar src={avatar || ""} sx={{ width: 120, height: 120 }} />

        <Typography
          variant="h5"
          sx={{ mt: 1, fontWeight: 700, color: "text.primary" }}
        >
          {userName ?? "Player"}
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap" }}>
          <Button
            startIcon={<IoPencil />}
            variant="contained"
            color="primary"
            onClick={() => navigate("/edit-user-info")}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              px: 2.5,
              boxShadow: 2,
            }}
          >
            编辑信息
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => logout()}
            sx={{ textTransform: "none", borderRadius: 3, px: 2.5 }}
          >
            退出
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid
        container
        spacing={2}
        sx={{ mt: 3 }}
        justifyContent="center" // horizontal center
        alignItems="center"
      >
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 4, md: 3 }}>
            <Card
              elevation={0}
              sx={(theme) => ({
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                border: 1,
                borderColor: "divider",
                textAlign: "center",
              })}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    color: "primary.main",
                    fontSize: 22,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {s.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, lineHeight: 1.1 }}
                >
                  {s.value}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {s.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Achievements */}
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 1.5, color: "text.primary", fontWeight: 700 }}
        >
          成就
        </Typography>
        <Card
          elevation={0}
          sx={(theme) => ({
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            border: 1,
            borderColor: "divider",
          })}
        >
          <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontWeight: 600 }}>
              敬请期待
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UserProfile;
