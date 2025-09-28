import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { IoMenu, IoHome, IoPerson } from "react-icons/io5";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/taylor-swift.svg";
import { AuthContext } from "../context/AuthContex";

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
} from "@mui/material";

const SideBar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const drawerWidth = 260;

  const navigate = useNavigate();

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setDrawerOpen(open);
    };
  const list = () => (
    <Box
      role="presentation"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" p={2}>
        <img
          src={logo}
          alt="Logo"
          style={{ width: 40, height: 40, marginRight: 10 }}
        />
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontFamily: "PlaywriteIN, cursive" }}
        >
          True Swiftie
        </Typography>
      </Box>
      {/* Nav items */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <List>
          <ListItem key={1} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/");
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon>
                <IoHome />
              </ListItemIcon>
              <ListItemText primary={"Home"} />
            </ListItemButton>
          </ListItem>
          <ListItem key={2} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/profile");
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon>
                <IoPerson />
              </ListItemIcon>
              <ListItemText primary={"ME!"} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      {/* Bottom actions */}
      <Box p={2}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={() => {
            logout();
            setDrawerOpen(false);
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile menu opener (since top bar is removed) */}
      {!drawerOpen && (
        <IconButton
          aria-label="open menu"
          onClick={toggleDrawer(true)}
          sx={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 1300,
            display: { xs: "inline-flex", md: "none" },
          }}
        >
          <IoMenu />
        </IconButton>
      )}
      {/* Mobile: temporary drawer */}
      <Drawer
        anchor="left"
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {list()}
      </Drawer>

      {/* Desktop: permanent sidebar */}
      <Drawer
        anchor="left"
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {list()}
      </Drawer>
    </>
  );
};

export default SideBar;
