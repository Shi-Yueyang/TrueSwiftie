import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, TextField, Typography, IconButton, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  IoPencil,
  IoPerson,
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoChevronBack,
} from "react-icons/io5";

const EditUserInfo = () => {
  const navigate = useNavigate();

  // Form state (replace defaults with your real data source if available)
  const [username, setUsername] = useState("Gamer123");
  const [email, setEmail] = useState("gamer@example.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar upload/preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    return null;
  }, [avatarFile]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPickAvatar = () => fileInputRef.current?.click();

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with your API and/or AuthContext.
    // Example:
    // await api.updateProfile({ username, email, password, avatar: avatarFile });
    navigate(-1);
  };

  // password visibility toggle handled inline

  return (
    <Box
      component="form"
      onSubmit={onSave}
      sx={{
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Back */}
      <Box sx={{ mb: 2 }}>
        <IconButton aria-label="Back to profile" onClick={() => navigate("/profile")}> 
          <IoChevronBack />
        </IconButton>
      </Box>
      {/* Avatar */}
      <Box sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            mx: "auto",
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
            bgcolor: "background.default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: 1,
          }}
        >
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt="Avatar"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Box sx={{ color: "text.secondary", display: "flex" }}>
              <IoPerson size={72} />
            </Box>
          )}
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onAvatarChange}
        />

        <Button
          variant="outlined"
          color="primary"
          startIcon={<IoPencil />}
          onClick={onPickAvatar}
          sx={{ mt: 2, borderRadius: 999 }}
        >
          Edit Avatar
        </Button>
      </Box>

      {/* Form fields */}
      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Username
        </Typography>
        <TextField
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Gamer123"
          fullWidth
          size="medium"
          autoComplete="off"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IoPerson />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
          Email
        </Typography>
        <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="gamer@example.com"
          fullWidth
          size="medium"
          autoComplete="email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IoMailOutline />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
          Password
        </Typography>
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a password"
          fullWidth
          size="medium"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IoLockClosedOutline />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
          Confirm Password
        </Typography>
        <TextField
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          fullWidth
          size="medium"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          error={confirmPassword.length > 0 && confirmPassword !== password}
          helperText={
            confirmPassword.length > 0 && confirmPassword !== password
              ? "Passwords do not match"
              : ""
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IoLockClosedOutline />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword((s) => !s)} edge="end">
                  {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Actions */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={confirmPassword !== "" && confirmPassword !== password}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditUserInfo;
