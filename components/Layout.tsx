import React, { PropsWithChildren } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
} from "@mui/material";
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
        display: "flex",
        flexDirection: "column",
        height: "100vh", // ← 固定高に
        overflow: "hidden", // ← スクロール禁止
        bgcolor: "background.default",
      }}
    >
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Caveat', cursive",
              cursor: "pointer",
              flexGrow: 1,
            }}
            onClick={handleTitleClick}
          >
            DateList
          </Typography>
          <Button
            color="inherit"
            onClick={handleAboutClick}
            sx={{ fontFamily: "'Yomogi', cursive" }}
          >
            このアプリについて
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        disableGutters
        sx={{
          flexGrow: 1,
          overflow: "hidden", // ← main部分のスクロール禁止
        }}
      >
        {children}
      </Container>

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
          © 2025 DateList
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
