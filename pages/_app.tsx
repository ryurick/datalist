import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./styles.css";
import type { AppProps } from "next/app";

const theme = createTheme({
  palette: {
    primary: {
      main: "#a5d6a7", // 淡いグリーン
    },
    secondary: {
      main: "#ffcc80", // 淡いオレンジ
    },
    background: {
      default: "#f0f4f8", // 淡いグレー
      paper: "#ffffff", // 白
    },
    text: {
      primary: "#333333", // ダークグレー
      secondary: "#666666", // ライトグレー
    },
  },
  typography: {
    fontFamily: "'Kosugi Maru', sans-serif", // 日本語フォントをKosugi Maruに統一
    h1: {
      fontFamily: "'Kosugi Maru', sans-serif",
    },
    h2: {
      fontFamily: "'Kosugi Maru', sans-serif",
    },
    h3: {
      fontFamily: "'Kosugi Maru', sans-serif",
    },
    h4: {
      fontFamily: "'Kosugi Maru', sans-serif",
    },
    h5: {
      fontFamily: "'Kosugi Maru', sans-serif",
    },
    h6: {
      fontFamily: "'Kosugi Maru', sans-serif",
    },
    body1: {
      fontFamily: "'Kosugi Maru', sans-serif",
    },
    body2: {
      fontFamily: "'Kosugi Maru', sans-serif",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          fontFamily: "'Kosugi Maru', sans-serif",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Kosugi Maru', sans-serif",
          fontWeight: "bold",
          fontSize: "1rem",
          borderRadius: "24px",
          textTransform: "none",
          transition: "0.3s",
          "&:hover": {
            transform: "scale(1.05)",
          },
        },
        containedPrimary: {
          backgroundColor: "#aed581", // 淡いグリーン
          "&:hover": {
            backgroundColor: "#9ccc65", // 少し濃いグリーン
          },
        },
        containedSecondary: {
          backgroundColor: "#ffcc80", // 淡いオレンジ
          "&:hover": {
            backgroundColor: "#ffb74d", // 少し濃いオレンジ
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "'Kosugi Maru', sans-serif",
        },
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
