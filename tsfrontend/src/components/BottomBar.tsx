import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { IoHome, IoPerson } from "react-icons/io5";

/**
 * BottomBar
 *
 * A mobile-bottom navigation component that mirrors the routes used in the Sidebar (NavBar).
 * Not wired into the app yet per request; import and render where needed (e.g., mobile layouts).
 *
 * Route mapping intentionally matches Sidebar:
 *  - Home -> "/"
 *  - ME!  -> "/profile"
 */
const BottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define items to mirror Sidebar/NavBar
  const items = useMemo(
    () => [
      { label: "Home", icon: <IoHome />, path: "/" },
      { label: "ME!", icon: <IoPerson />, path: "/profile" },
    ],
    []
  );

  const [value, setValue] = useState(0);

  // Keep selection in sync with current route
  useEffect(() => {
    const idx = items.findIndex((it) => it.path === location.pathname);
    setValue(idx >= 0 ? idx : 0);
  }, [location.pathname, items]);

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: { xs: "block", md: "none" }, // typically shown on mobile only
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newValue: number) => {
          setValue(newValue);
          const target = items[newValue];
          if (target) navigate(target.path);
        }}
      >
        {items.map((it) => (
          <BottomNavigationAction key={it.path} label={it.label} icon={it.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomBar;
