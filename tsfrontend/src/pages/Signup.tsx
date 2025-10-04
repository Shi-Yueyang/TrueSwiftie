import { TextField, Button, Typography, Box, Alert, InputAdornment, IconButton } from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContex";
import { FiEye, FiEyeOff, FiUser } from "react-icons/fi";


const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const { login, userId } = useContext(AuthContext);

  useEffect(() => {
    if (userId) {
      navigate("/", { replace: true });
    }
  }, [userId, navigate]);

  const handleSignup = () => {
    // register
    axios
      .post(`${import.meta.env.VITE_BACKEND_IP}/core/users/`, {
        username,
        password,
        temporary_name: username,
      })
      .then(() => {
        // log in
        axios
          .post(`${import.meta.env.VITE_BACKEND_IP}/api/token/`, {
            username,
            password,
          })
          .then((responseLogin) => {
            const accessToken = responseLogin.data.access;
            // Me
            axios
              .get(`${import.meta.env.VITE_BACKEND_IP}/core/users/me/`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              })
              .then((responseMe) => {
                login(
                  responseMe.data.id,
                  responseMe.data.username,
                  responseLogin.data.access,
                  responseLogin.data.refresh,
                  responseMe.data.is_staff,
                  responseMe.data.groups,
                  responseMe.data.avatar
                );
                navigate("/");
              });
          });
      })
      .catch((response) => {
        setError(response.response.data.username);
      });
  };

  return (
    <Box display="flex" minHeight="100vh">
      {/* Left: Form panel */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, sm: 6 },
          py: { xs: 6, md: 0 },
          backgroundColor: "#fff",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Brand */}
          <Typography variant="h6" sx={{ mb: 6, fontWeight: 600 }}>
            TrueSwiftie
          </Typography>

          {/* Headings */}
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            Start your journey
          </Typography>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
            注册
          </Typography>

          {/* Form */}
          <TextField
            label="用户名"
            placeholder="yourname"
            variant="outlined"
            margin="normal"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <FiUser size={18} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="密码"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="确认密码"
            type={showRePassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={rePassword}
            fullWidth
            onChange={(e) => setRePassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowRePassword((s) => !s)}
                    edge="end"
                    size="small"
                  >
                    {showRePassword ? <FiEyeOff /> : <FiEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, py: 1.2 }}
            onClick={handleSignup}
          >
            注册
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}



          {/* Login link */}
          <Box display="flex" alignItems="center" gap={1} mt={3}>
            <Typography variant="body2">已有账户</Typography>
            <Button variant="text" onClick={() => navigate("/login")}>
              登录
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Right: Image placeholder panel */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: "50%",
          backgroundImage: "url('/login.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </Box>
  );
};

export default Signup;
