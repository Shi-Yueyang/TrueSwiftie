import React, { useContext,useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Stack,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  IoGameControllerOutline,
  IoRocketOutline,
  IoTrophyOutline,
  IoStatsChartOutline,
} from "react-icons/io5";
import "@fontsource/poppins";
import { AppContext } from "../context/AppContext";
import { fetchGameTurn, startGameSession } from "../services/api";

type QuickPlayCardProps = {
  title: string;
  gradient: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  onClick: () => void;
  disabled?: boolean;
  badgeText?: string;
};

const QuickPlayCard: React.FC<QuickPlayCardProps> = ({
  title,
  gradient,
  Icon,
  onClick,
  disabled = false,
  badgeText,
}) => (
  // Use theme-based styling inside sx callbacks
  <Card
    elevation={3}
    sx={{
      borderRadius: 3,
      overflow: "hidden",
      bgcolor: "transparent",
    }}
  >
    <CardActionArea
      onClick={onClick}
      disabled={disabled}
      sx={{ p: 0, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16/9",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 200ms ease, box-shadow 200ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 6,
          },
          opacity: disabled ? 0.75 : 1,
          filter: disabled ? "grayscale(0.25)" : "none",
        }}
      >
        {/* Icon tinted with theme white at high opacity */}
        <Box
          sx={(theme) => ({ color: alpha(theme.palette.common.white, 0.95) })}
        >
          <Icon size={88} />
        </Box>
        {/* Badge (e.g., Under construction) */}
        {badgeText ? (
          <Box
            sx={(theme) => ({
              position: "absolute",
              right: 12,
              top: 10,
              px: 1,
              py: 0.25,
              borderRadius: 1.5,
              fontSize: 12,
              fontWeight: 600,
              color: theme.palette.warning.contrastText,
              bgcolor: alpha(theme.palette.warning.main, 0.9),
              letterSpacing: 0.2,
            })}
          >
            {badgeText}
          </Box>
        ) : null}
        <Box
          sx={(theme) => ({
            position: "absolute",
            left: 16,
            bottom: 12,
            px: 1.25,
            py: 0.5,
            bgcolor: alpha(theme.palette.common.black, 0.35),
            borderRadius: 2,
            backdropFilter: "blur(4px)",
          })}
        >
          <Typography
            variant="subtitle1"
            sx={(theme) => ({
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              color: theme.palette.common.white,
              letterSpacing: 0.3,
            })}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </CardActionArea>
  </Card>
);

type DataCardProps = {
  title: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  onClick: () => void;
};

const DataCard: React.FC<DataCardProps> = ({ title, Icon, onClick }) => (
  <Card
    elevation={1}
    sx={{
      borderRadius: 3,
      height: 140,
      transition: "box-shadow 200ms ease, transform 200ms ease",
      "&:hover": { boxShadow: 5, transform: "translateY(-2px)" },
    }}
  >
    <CardActionArea
      onClick={onClick}
      sx={{ height: "100%", display: "flex", alignItems: "center" }}
    >
      <CardContent sx={{ width: "100%" }}>
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={1.5}
          sx={{ textAlign: "center" }}
        >
          <Box sx={(theme) => ({ color: theme.palette.primary.main })}>
            <Icon size={34} />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              color: "text.primary",
              letterSpacing: 0.2,
            }}
          >
            {title}
          </Typography>
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { setGameSession, setCurrentTurn,sound,setSound } = useContext(AppContext);
  const quickRowRef = useRef<HTMLDivElement | null>(null);

  // Gradients built from theme palette only
  const classicGradient = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;
  const arcadeGradient = `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`;

  const handleStartClassic = async () => {
    try {
      const session = await startGameSession();
      setGameSession(session);
      if (session.current_turn) {
        const turn = await fetchGameTurn(session.current_turn);
        setCurrentTurn(turn);
      }
      navigate("/game");
    } catch (e) {
      console.error("Failed to start game session", e);
    }
  };
  const handleWheelHorizontal = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = quickRowRef.current;
    if (!el) return;
    // translate vertical wheel to horizontal scroll on overflow row
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };
  useEffect(() => {
    // clean up any existing sound instance
    if (sound) {
      sound.fade(1, 0, 300);
      sound.stop();
      sound.unload();
      setSound(null);

      console.log("homepage unload sound")
    }
  }, []);
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      {/* Quick Play */}
      <Typography
        variant="h6"
        sx={{
          mt: { xs: 7, sm: 2 },
          mb: 1.5,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          color: "text.primary",
        }}
      >
        快速游戏
      </Typography>

      <Box
        ref={quickRowRef}
        onWheel={handleWheelHorizontal}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          overflowY: "hidden",
          pb: 1,
          mb: 3,
          scrollSnapType: { xs: "x proximity", sm: "initial" },
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          // Hide scrollbar cross-browser
          msOverflowStyle: "none", // IE/Edge
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": { display: "none" }, // Chrome/Safari
        }}
      >
        <Box sx={{ flex: "0 0 auto", width: { xs: 280, sm: 360, md: 420 }, scrollSnapAlign: { xs: "start", sm: "none" } }}>
          <QuickPlayCard
            title="经典猜歌"
            Icon={IoGameControllerOutline}
            gradient={classicGradient}
            onClick={handleStartClassic}
          />
        </Box>
        <Box sx={{ flex: "0 0 auto", width: { xs: 280, sm: 360, md: 420 }, scrollSnapAlign: { xs: "start", sm: "none" } }}>
          <QuickPlayCard
            title="新模式"
            Icon={IoRocketOutline}
            gradient={arcadeGradient}
            onClick={() => {}}
            disabled
            badgeText="Under construction"
          />
        </Box>
      </Box>

      {/* Data */}
      <Typography
        variant="h6"
        sx={{
          mb: 1.5,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          color: "text.primary",
        }}
      >
        查看
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DataCard
            title="周榜"
            Icon={IoTrophyOutline}
            onClick={() => navigate("/top-players")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DataCard
            title="游戏记录"
            Icon={IoStatsChartOutline}
            onClick={() => navigate("/game-history")}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
