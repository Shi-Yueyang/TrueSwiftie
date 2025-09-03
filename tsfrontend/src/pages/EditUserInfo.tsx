import React, { useState } from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";

const EditUserInfo = () => {
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
    rePassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("User Info Updated:", userInfo);
    // Add API call to update user info here
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ height: "95vh", textAlign: "center" }}
    >
      <Grid item xs={12} md={6}>
        <Typography variant="h4" gutterBottom>
          Edit User Information
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={userInfo.username}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={userInfo.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            name="password"
            value={userInfo.password}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Re-enter Password"
            type="password"
            name="rePassword"
            value={userInfo.rePassword}
            onChange={handleChange}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: "1rem" }}
          >
            Save Changes
          </Button>
        </form>
      </Grid>
    </Grid>
  );
};

export default EditUserInfo;
