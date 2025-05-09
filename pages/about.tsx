import React from "react";
import { Typography, Box } from "@mui/material";
import Layout from "../components/Layout";

const About: React.FC = () => {
  return (
    <Layout>
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 8,
          textAlign: "center",
          p: 2,
          bgcolor: "#f1f8e9", // 淡いグリーン
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ fontFamily: "'Yomogi', sans-serif", color: "#333" }}
        >
          このアプリについて
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ fontFamily: "'Yomogi', sans-serif", color: "#555" }}
        >
          GoListは、あなたとあなたの大切な人が行きたい場所ややりたいことを簡単に共有できるアプリです。
          楽しい思い出を一緒に作りましょう！
        </Typography>
      </Box>
    </Layout>
  );
};

export default About;
