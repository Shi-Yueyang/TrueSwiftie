import { TextField, Button, Typography, Box, Alert } from "@mui/material";
import axios from "axios";
import { useContext, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContex";

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

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
                  responseMe.data.groups
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
        Signup
      </Typography>
      <TextField
        label="Username"
        variant="outlined"
        margin="normal"
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{
          "& .MuiInputLabel-root": { color: "grey" },
          "& .MuiOutlinedInput-root": {
            "& input": { color: "black" },
          },
        }}
      />

      <TextField
        label="Password"
        type="password"
        variant="outlined"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{
          "& .MuiInputLabel-root": { color: "grey" },
          "& .MuiOutlinedInput-root": {
            "& input": { color: "black" },
          },
        }}
      />
      <TextField
        label="Re-enter Password"
        type="password"
        variant="outlined"
        margin="normal"
        value={rePassword}
        fullWidth
        onChange={(e) => setRePassword(e.target.value)}
        sx={{
          "& .MuiInputLabel-root": { color: "grey" },
          "& .MuiOutlinedInput-root": {
            "& input": { color: "black" },
          },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSignup}
      >
        Signup
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Signup;
