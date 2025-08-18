import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { IoMenu } from "react-icons/io5";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/taylor-swift.svg";
import { AuthContext } from "../context/AuthContex";

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Drawer,
} from "@mui/material";

const NavBar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isStaff, groups, logout } = useContext(AuthContext);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const drawerWidth = 260;

  useEffect(() => {
    if (isStaff || groups?.includes("formal")) {
      setIsGuest(false);
    } else {
      setIsGuest(true);
    }
  }, [isStaff, groups]);

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
    <Box role="presentation">
      <Box display="flex" alignItems="center" p={2}>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 1, display: { xs: "inline-flex", md: "none" } }}
        >
          <IoMenu />
        </IconButton>
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
      <List>
        <ListItem key={1} disablePadding>
          <ListItemButton
            onClick={() => {
              navigate("/");
              setDrawerOpen(false);
            }}
          >
            <ListItemText primary={"Home"} />
          </ListItemButton>
        </ListItem>
        <ListItem key={2} disablePadding>
          <ListItemButton
            onClick={() => {
              navigate("/game-history");
              setDrawerOpen(false);
            }}
          >
            <ListItemText primary={"Game History"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          zIndex: 1100,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { md: "none" } }}
            onClick={toggleDrawer(true)}
          >
            <IoMenu />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {isGuest ? (
            <>
              <Button color="inherit" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate("/signup")}>
                Signup
              </Button>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={() => {
                logout();
              }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
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

export default NavBar;
