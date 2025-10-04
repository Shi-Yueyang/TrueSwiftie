import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContex";
import { updateUserProfile } from "../services/api";
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
  const {
    userId,
    userName,
    email: ctxEmail,
    avatar: ctxAvatar,
    refreshUser,
  } = useContext(AuthContext);

  // Form state (prefilled from AuthContext)
  const [username, setUsername] = useState(userName ?? "");
  const [email, setEmail] = useState(ctxEmail ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar upload/preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UX state
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // track original values based on current context (updates when context changes)
  const original = useMemo(
    () => ({ username: userName ?? "", email: ctxEmail ?? "" }),
    [userName, ctxEmail]
  );
  const isDirty =
    username !== original.username ||
    email !== original.email ||
    password.length > 0 ||
    avatarFile !== null;

  const previewUrl = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    return ctxAvatar || null;
  }, [avatarFile, ctxAvatar]);

  // keep local form inputs in sync if context changes (e.g., after refreshUser)
  useEffect(() => {
    setUsername(userName ?? "");
    setEmail(ctxEmail ?? "");
  }, [userName, ctxEmail]);

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

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!isDirty) return;
    if (confirmPassword !== "" && confirmPassword !== password) return;
    try {
      setSaving(true);
      await updateUserProfile(userId, {
        username,
        email,
        password: password || undefined,
        avatar: avatarFile,
      });
      await refreshUser();
      setSnackbar({
        open: true,
        message: "Profile updated",
        severity: "success",
      });
      // Optionally navigate back after a short delay
      setTimeout(() => navigate(-1), 600);
    } catch (err) {
      console.error("Failed to update profile", err);
      setSnackbar({
        open: true,
        message: "Failed to update profile",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
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
        <IconButton
          aria-label="Back to profile"
          onClick={() => navigate("/profile")}
        >
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
          编辑头像
        </Button>
      </Box>

      {/* Form fields */}
      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          用户名
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

        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mt: 3, mb: 1 }}
        >
          邮箱
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

        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mt: 3, mb: 1 }}
        >
          密码
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
                <IconButton
                  onClick={() => setShowPassword((s) => !s)}
                  edge="end"
                >
                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mt: 3, mb: 1 }}
        >
          确认密码
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
                <IconButton
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  edge="end"
                >
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
            disabled={
              saving ||
              !isDirty ||
              (confirmPassword !== "" && confirmPassword !== password)
            }
            startIcon={
              saving ? (
                <CircularProgress color="inherit" size={16} />
              ) : undefined
            }
            sx={{ borderRadius: 2, px: 3 }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditUserInfo;
