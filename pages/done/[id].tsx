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
            maxWidth: 600,
            mx: "auto",
            textAlign: "center",
            p: 3,
            bgcolor: "#ffffff",
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            position: "relative",
            top: "-5vh",
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
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontFamily: "'Yomogi', sans-serif", color: "#555" }}
          >
            以下のURLを共有して、恋人・友達と一緒に楽しみましょう。
          </Typography>
          <Box
            sx={{
              bgcolor: "#f0f4f8",
              p: 2,
              borderRadius: 1,
              mb: 2,
              wordBreak: "break-all",
            }}
          >
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                fontFamily: "'Yomogi', sans-serif",
                fontSize: "0.875rem",
              }}
            >
              {url}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCopyUrl}
              sx={{
                fontFamily: "'Yomogi', sans-serif",
                fontWeight: "bold",
                fontSize: "0.875rem",
              }}
            >
              URLをコピー
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenList}
              sx={{
                fontFamily: "'Yomogi', sans-serif",
                fontWeight: "bold",
                fontSize: "0.875rem",
                bgcolor: "#80cbc4",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#4db6ac",
                },
              }}
            >
              GoListをひらく
            </Button>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default Done;
