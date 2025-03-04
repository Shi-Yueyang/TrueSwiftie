import { TextField, Button, Typography, Box, Alert } from "@mui/material";
import axios from "axios";
import { useContext, useRef, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContex";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const { login } = useContext(AuthContext);

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
        responseMe.data.groups
      );

      navigate("/ ");
    } catch (err) {
      setError("Invalid username or password");
      if (formRef.current) formRef.current.reset();
    }
  };
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={3}
      boxShadow={3}
      borderRadius={2}
    >
      <Button
        startIcon={<BiArrowBack />}
        onClick={() => {
          navigate("/");
        }}
        sx={{ alignSelf: "flex-start", mb: 2 }}
      >
        Home
      </Button>
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <TextField
        label="username"
        margin="normal"
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{
          "& .MuiInputLabel-root": { color: "grey" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "grey" },
            "&:hover fieldset": { borderColor: "grey" },
            "&.Mui-focused fieldset": { borderColor: "grey" },
            "& input": { color: "grey" },
          },
        }}
      />
      <TextField
        label="Password"
        type="password"
        margin="normal"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{
          "& .MuiInputLabel-root": { color: "grey" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "grey" },
            "&:hover fieldset": { borderColor: "grey" },
            "&.Mui-focused fieldset": { borderColor: "grey" },
            "& input": { color: "grey" },
          },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleLogin}
      >
        Login
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Login;
