import React from "react";
import { Button, Typography, Box } from "@mui/material";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const Home: React.FC = () => {
  const router = useRouter();

  const handleStart = () => {
    router.push("/create");
  };

  return (
    <Layout>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #e0f7fa, #f1f8e9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Box
          sx={{
            maxHeight: "90vh",
            maxWidth: 600,
            width: "100%",
            p: 4,
            borderRadius: "24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            backgroundColor: "#ffffff",
            textAlign: "center",
            position: "relative",
            top: "-10vh",
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: "'Caveat', cursive",
              fontSize: "3rem",
              color: "#4caf50",
            }}
          >
            GoList
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            sx={{
              fontFamily: "'Yomogi', sans-serif",
              fontSize: "1.1rem",
              color: "#555",
            }}
          >
            恋人・友達と
            <br />
            行きたいところ・やりたいことを共有できるアプリ
          </Typography>
          <Button
            variant="contained"
            onClick={handleStart}
            sx={{
              mt: 4,
              fontFamily: "'Yomogi', sans-serif",
              fontWeight: "bold",
              fontSize: "1rem",
              px: 4,
              py: 1.5,
              borderRadius: "24px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "0.3s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            いますぐはじめる
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default Home;
