import React, { useState } from "react";
import { Button, TextField, Typography, Box, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { supabase } from "../supabaseClient";

const Create: React.FC = () => {
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const router = useRouter();

  const handleAddMember = () => {
    if (memberName.trim() !== "") {
      setMembers([...members, memberName]);
      setMemberName("");
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    const sharedurl = crypto.randomUUID(); // 共有用のランダムなトークンを生成
    const { data, error } = await supabase
      .from("groups")
      .insert([{ groupname: groupName, members, sharedurl }])
      .select("id") // 生成されたIDを取得
      .single();

    if (error) {
      console.error("Error creating group:", error);
      return;
    }

    const shareableLink = `${window.location.origin}/done/${data.id}`;
    console.log("Share this link:", shareableLink);

    // グループ作成結果画面にリダイレクト
    router.push(`/done/${data.id}`);
  };

  return (
    <Layout>
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 8,
          textAlign: "center",
          p: 2,
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
          新しいグループを作成して、友達と一緒に楽しみましょう！
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
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            label="メンバー名"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ fontFamily: "'Yomogi', sans-serif" }}
          />
          <IconButton onClick={handleAddMember} color="primary">
            <AddIcon />
          </IconButton>
        </Box>
        <Box>
          {members.map((member, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ flex: 1 }}>{member}</Typography>
              <IconButton
                onClick={() => handleRemoveMember(index)}
                color="secondary"
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
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
            bgcolor: "#f48fb1",
            "&:hover": {
              bgcolor: "#f06292",
            },
          }}
        >
          グループを作成する
        </Button>
      </Box>
    </Layout>
  );
};

export default Create;
