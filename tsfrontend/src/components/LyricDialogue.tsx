import React from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
} from "@mui/material";

interface LyricDialogueProps {
  open: boolean;
  onClose: () => void;
  songName: string;
  albumName?: string;
  lyrics: string;
  posterImage?: string | undefined;
}

const LyricDialogue: React.FC<LyricDialogueProps> = ({
  open,
  onClose,
  songName,
  albumName,
  lyrics,
  posterImage,
}) => {
  // Helper function to format lyrics
  const formatLyrics = (lyrics: string) => {
    if (!lyrics) return "Lyrics not available";

    const lines = lyrics.split("\n");

    return lines.map((line, index) => {
      const isSectionHeader =
        line.trim().startsWith("[") && line.trim().endsWith("]");

      if (line.trim() === "") {
        return <Box key={index} sx={{ height: 8 }} />;
      }

      if (isSectionHeader) {
        return (
          <Typography
            key={index}
            variant="subtitle2"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              mt: index === 0 ? 0 : 2,
              mb: 1,
              fontSize: "0.875rem",
            }}
          >
            {line.replace(/^\[|\]$/g, "").trim()}
          </Typography>
        );
      }

      return (
        <Typography
          key={index}
          variant="body2"
          sx={{
            lineHeight: 1.5,
            mb: 0.5,
            pl: 1,
            color: "#c4c0c0ff", 
          }}
        >
          {line}
        </Typography>
      );
    });
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ dir: "up" }}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          maxHeight: "80vh",
          position: "relative",
          overflow: "hidden",
        },
      }}
    >
      {/* Background Poster Image */}
      {posterImage && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${posterImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
          }}
        />
      )}

      {/* Dark overlay for better text readability */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(57, 57, 57, 0.8)", // Always use a darker overlay
          zIndex: 1,
        }}
      />

      <DialogTitle
        sx={{
          position: "relative",
          zIndex: 2,
          color: "#FFFFFF",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {songName}
        </Typography>
        {albumName && (
          <Typography variant="subtitle2" sx={{ color: "#a4a4a1ff" }}>
            Album: {albumName}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent
        sx={{
          position: "relative",
          zIndex: 2,
          pb: 2,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(241, 241, 241, 0.3)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(193, 193, 193, 0.7)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(161, 161, 161, 0.9)",
          },
        }}
      >
        <Box sx={{ fontFamily: "inherit" }}>{formatLyrics(lyrics)}</Box>
      </DialogContent>

      <DialogActions
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      >
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LyricDialogue;
