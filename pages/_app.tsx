import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type { AppProps } from "next/app";

const theme = createTheme({
  palette: {
    primary: {
      main: "#f48fb1", // ピンク系の色をヘッダーに
    },
    secondary: {
      main: "#90caf9", // ブルー系の色をアクセントに
    },
    background: {
      default: "#f5f5f5", // 明るいグレー
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
          fontFamily: "'Kosugi Maru', sans-serif", // ボタンのフォントをKosugi Maruに変更
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
