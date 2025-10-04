import { Box, Typography, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const Support = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2 }}>
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          width: "100%",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: 1,
        }}
      >

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton aria-label="back" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <IoArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            来支持了！！！
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            component="img"
            src="/paycode.jpg"
            alt="Payment QR"
            sx={{ width: "100%", maxWidth: 420, borderRadius: 2, boxShadow: 1 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Support;
