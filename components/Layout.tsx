import React, { PropsWithChildren } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useRouter } from "next/router";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();

  const handleTitleClick = () => {
    router.push("/");
  };

  const handleAboutClick = () => {
    router.push("/about");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#a5d6a7",
          color: "#1e3a5f",
          borderBottom: "1px solid #81c784",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Caveat', cursive",
              cursor: "pointer",
              flexGrow: 1,
              color: "#2e7d32",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
            }}
            onClick={handleTitleClick}
          >
            GoList
          </Typography>
          <Button
            color="inherit"
            onClick={handleAboutClick}
            disableRipple
            sx={{
              fontFamily: "'Yomogi', cursive",
              color: "#2e7d32",
              "&:hover": {
                backgroundColor: "transparent",
              },
              "&:focus": {
                backgroundColor: "transparent",
              },
              "&:active": {
                backgroundColor: "transparent",
              },
              WebkitTapHighlightColor: "transparent",
            }}
          >
            このアプリについて
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </Box>

      <Box
        component="footer"
        py={2}
        textAlign="center"
        bgcolor="#e0e0e0"
        sx={{
          fontFamily: "'Yomogi', cursive",
          flexShrink: 0,
        }}
      >
        <Typography variant="body2" color="textSecondary">
          © 2025 GoList
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
