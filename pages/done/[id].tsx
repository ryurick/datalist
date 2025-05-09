import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Typography, Box } from "@mui/material";
import Layout from "../../components/Layout";

const Done: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/list/${id}`);
    }
  }, [id]);

  const handleOpenList = () => {
    router.push(`/list/${id}`);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url).then(() => {
      alert("URLがコピーされました！");
    });
  };

  return (
    <Layout>
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 25,
          textAlign: "center",
          p: 3,
          bgcolor: "#fce4ec",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ fontFamily: "'Yomogi', sans-serif", color: "#333" }}
        >
          グループが作成されました！
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleCopyUrl}
          sx={{
            fontFamily: "'Yomogi', sans-serif",
            fontWeight: "bold",
            fontSize: "0.875rem",
            mb: 2,
          }}
        >
          URLをコピー
        </Button>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ fontFamily: "'Yomogi', sans-serif", color: "#555" }}
        >
          以下のURLを共有して、友達と一緒に楽しみましょう。
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          gutterBottom
          sx={{
            fontFamily: "'Yomogi', sans-serif",
            fontSize: "0.875rem",
            wordBreak: "break-all",
            bgcolor: "#ffffff",
            p: 1,
            borderRadius: 1,
            mb: 2,
          }}
        >
          {url}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenList}
          sx={{
            fontFamily: "'Yomogi', sans-serif",
            fontWeight: "bold",
            fontSize: "0.875rem",
            bgcolor: "#f8bbd0",
            textTransform: "none",
            "&:hover": {
              bgcolor: "#f48fb1",
            },
          }}
        >
          DateListをひらく
        </Button>
      </Box>
    </Layout>
  );
};

export default Done;
