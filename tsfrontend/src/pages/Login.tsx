import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  // Divider,
} from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContex";
import { FiMail, FiEye, FiEyeOff } from "react-icons/fi";
// import { FcGoogle } from "react-icons/fc";
// import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { login, userId } = useContext(AuthContext);

  useEffect(() => {
    if (userId) {
      navigate("/", { replace: true });
    }
  }, [userId, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const responseLogin = await axios.post(
        `${import.meta.env.VITE_BACKEND_IP}/api/token/`,
        { username, password }
      );

      const token = responseLogin.data.access;

      const responseMe = await axios.get(
        `${import.meta.env.VITE_BACKEND_IP}/core/users/me/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      login(
        responseMe.data.id,
        responseMe.data.username,
        responseLogin.data.access,
        responseLogin.data.refresh,
        responseMe.data.is_staff,
        responseMe.data.groups,
        responseMe.data.avatar
      );

      navigate("/", { replace: true });
    } catch (err) {
      setError("Invalid username or password");
      if (formRef.current) formRef.current.reset();
    }
  };

  // Custom Google sign-in via useGoogleLogin; replace default button with an icon trigger
  // const googleLogin = useGoogleLogin({

  //   onSuccess: async (tokenResponse) => {
  //     try {
  //       console.log("Google token response:", tokenResponse);
  //       setError("");
  //       const access_token = (tokenResponse as any).access_token;

  //       // Exchange Google OAuth token with your backend for your app's JWT
  //       const res = await axios.post(
  //         `${import.meta.env.VITE_BACKEND_IP}/core/users/google-login/`,
  //         { access_token }
  //       );

  //       const { access, refresh, user } = res.data;
  //       login(
  //         user.id,
  //         user.username,
  //         access,
  //         refresh,
  //         user.is_staff,
  //         user.groups ?? [],
  //         user.avatar
  //       );
  //       navigate("/", { replace: true });
  //     } catch (err) {
  //       setError("Google sign-in failed. Please try again.");
  //     }
  //   },
  //   onError: () => setError("Google sign-in was cancelled or failed."),
  // });
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


          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
            登录
          </Typography>

          {/* Form */}
          <Box component="form" ref={formRef} onSubmit={handleLogin}>
            <TextField
              label="邮箱或用户名"
              margin="normal"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <FiMail size={18} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="密码"
              type={showPassword ? "text" : "password"}
              margin="normal"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, py: 1.2 }}
              onClick={handleLogin}
            >
              登录
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {/* Divider and social sign-in placeholders */}
            {/* <Divider sx={{ my: 3 }}>or sign in with</Divider>
            <Box display="flex" gap={2} justifyContent="center">
              <IconButton
                size="large"
                aria-label="Sign in with Google"
                onClick={() => googleLogin()}
              >
                <FcGoogle size={28} />
              </IconButton>
            </Box> */}

            {/* Register link */}
            <Box display="flex" alignItems="center" gap={1} mt={3}>
              <Typography variant="body2">没有账户?</Typography>
              <Button variant="text" onClick={() => navigate("/signup")}>
                注册
              </Button>
            </Box>
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

export default Login;
