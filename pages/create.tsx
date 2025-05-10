import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import RemoveIcon from "@mui/icons-material/Remove";
import { supabase } from "../supabaseClient";

const Create: React.FC = () => {
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddMember = () => {
    if (memberName.trim() === "") {
      setError("メンバー名を入力してください。");
      return;
    }
    setMembers((prev) => [...prev, memberName.trim()]);
    setMemberName("");
    setError(null);
  };

  const handleRemoveMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (groupName.trim() === "") {
      setError("グループ名は必須です。");
      return;
    }

    if (members.length === 0) {
      setError("少なくとも1人のメンバーを追加してください。");
      return;
    }

    const sharedurl = crypto.randomUUID();
    const { data, error } = await supabase
      .from("groups")
      .insert([{ groupname: groupName, members, sharedurl }])
      .select("id")
      .single();

    if (error) {
      console.error("Error creating group:", error);
      setError("グループの作成中にエラーが発生しました。");
      return;
    }

    const shareableLink = `${window.location.origin}/done/${data.id}`;
    console.log("Share this link:", shareableLink);

    router.push(`/done/${data.id}`);
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
            p: 2,
            bgcolor: "#ffffff",
            borderRadius: "24px",
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
            グループを作成
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontFamily: "'Yomogi', sans-serif", color: "#555" }}
          >
            新しいグループを作成して、
            <br />
            一緒にGoListを作りましょう！
          </Typography>
          <TextField
            label="グループ名"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ mb: 2, fontFamily: "'Yomogi', sans-serif" }}
          />
          <TextField
            label="メンバー名"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ fontFamily: "'Yomogi', sans-serif" }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            sx={{
              maxHeight: "100px",
              overflowY: "auto",
              mb: 2,
            }}
          >
            {members.map((member, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "#f1f8e9",
                  p: 1,
                  mb: 1,
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Typography
                  sx={{ flex: 1, fontFamily: "'Kosugi Maru', sans-serif" }}
                >
                  {member}
                </Typography>
                <IconButton
                  onClick={() => handleRemoveMember(index)}
                  color="secondary"
                  sx={{ ml: 1 }}
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddMember}
            fullWidth
            sx={{
              fontFamily: "'Yomogi', sans-serif",
              fontWeight: "bold",
              fontSize: "1rem",
              bgcolor: "#aed581",
              "&:hover": {
                bgcolor: "#9ccc65",
              },
            }}
          >
            メンバーを追加
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
            fullWidth
            sx={{
              mt: 3,
              fontFamily: "'Yomogi', sans-serif",
              fontWeight: "bold",
              fontSize: "1rem",
              bgcolor: "#aed581",
              "&:hover": {
                bgcolor: "#9ccc65",
              },
            }}
          >
            グループを作成する
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default Create;
