import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Checkbox,
  Box,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Card,
  CardContent,
  Collapse,
  Snackbar,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useSpring, animated } from "@react-spring/web";

import { supabase } from "../../supabaseClient";

// Placeの型定義
type Place = {
  id: string;
  title: string;
  note: string;
  url: string;
  visited: boolean;
  favorite?: boolean;
  member: string; // メンバーを追加
};

// 共通のテキストスタイルを更新
const commonTypographyStyle = {
  primary: {
    fontWeight: 600,
    fontSize: "0.9rem",
    color: "#1e3a5f",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    mb: 0.25,
    fontFamily: "'Kosugi Maru', sans-serif",
  },
  secondary: {
    fontSize: "0.8rem",
    color: "#4a6785",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontFamily: "'Kosugi Maru', sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: 0.25,
  },
  url: {
    fontFamily: "'Kosugi Maru', sans-serif",
    color: "#4a6785",
    textDecoration: "underline",
  },
};

const ListPage: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [placesToVisit, setPlacesToVisit] = useState<Place[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<Place[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editPlace, setEditPlace] = useState<Place | null>(null);
  const [groupName, setGroupName] = useState("グループ名");
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [checkedAnimationIndex, setCheckedAnimationIndex] = useState<
    number | null
  >(null);
  const [members, setMembers] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [newMember, setNewMember] = useState("");
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(() => {
    return placesToVisit.length === 0 && visitedPlaces.length === 0;
  });

  const animationProps = useSpring({
    maxHeight: isExpanded ? 500 : 0,
    config: { duration: 800 }, // アニメーションの速度を調整
  });

  useEffect(() => {
    const fetchData = async () => {
      const { id } = router.query;
      if (id) {
        const { data, error } = await supabase
          .from("groups")
          .select("groupname, members")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching group:", error);
          return;
        }

        setGroupName(data.groupname);
        setMembers(data.members);

        const { data: placesData, error: placesError } = await supabase
          .from("places")
          .select("*")
          .eq("groupid", id);

        if (placesError) {
          console.error("Error fetching places:", placesError);
          return;
        }

        setPlacesToVisit(placesData.filter((place) => !place.visited));
        setVisitedPlaces(placesData.filter((place) => place.visited));

        // データを取得した後に入力枠の表示状態を更新
        setIsExpanded(placesData.length === 0);
      }
    };

    fetchData();

    // リアルタイムのリスナーを設定
    const placesChannel = supabase
      .channel("places")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "places",
          filter: `groupid=eq.${router.query.id}`,
        },
        (payload) => {
          console.log("New place inserted:", payload.new); // デバッグ用ログ
          setPlacesToVisit((prev) => [...prev, payload.new as Place]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "places",
          filter: `groupid=eq.${router.query.id}`,
        },
        (payload) => {
          setPlacesToVisit((prev) =>
            prev.map((place) =>
              place.id === payload.new.id ? (payload.new as Place) : place
            )
          );
          setVisitedPlaces((prev) =>
            prev.map((place) =>
              place.id === payload.new.id ? (payload.new as Place) : place
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "places",
          filter: `groupid=eq.${router.query.id}`,
        },
        (payload) => {
          setPlacesToVisit((prev) =>
            prev.filter((place) => place.id !== payload.old.id)
          );
          setVisitedPlaces((prev) =>
            prev.filter((place) => place.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    // クリーンアップ
    return () => {
      supabase.removeChannel(placesChannel);
    };
  }, [router.query]);

  const handleAddPlace = async () => {
    if (title.trim() === "" || selectedMember === "") {
      alert("タイトルとメンバーは必須です。");
      return;
    }

    const groupId = router.query.id;
    if (!groupId) {
      console.error("Invalid group ID");
      return;
    }

    const newPlace = {
      title,
      note,
      url,
      visited: false,
      favorite: false,
      member: selectedMember,
    };

    // データベースに新しい場所を挿入
    const { data, error } = await supabase
      .from("places")
      .insert([{ ...newPlace, groupid: groupId }]);

    if (error) {
      console.error("Error adding place:", error);
      return;
    }

    console.log("Inserted data:", data);

    // データを再取得
    const { data: placesData, error: placesError } = await supabase
      .from("places")
      .select("*")
      .eq("groupid", groupId);

    if (placesError) {
      console.error("Error fetching places:", placesError);
      return;
    }

    setPlacesToVisit(placesData.filter((place) => !place.visited));
    setVisitedPlaces(placesData.filter((place) => place.visited));

    setTitle("");
    setNote("");
    setUrl("");
    setSelectedMember("");
  };

  const handleToggleVisited = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedAnimationIndex(index);
    const place = placesToVisit[index];

    // データベースを更新
    const { error } = await supabase
      .from("places")
      .update({ visited: true })
      .eq("id", place.id);

    if (error) {
      console.error("Error updating visited status:", error);
      setCheckedAnimationIndex(null); // エラー時にアニメーションをリセット
      return;
    }

    // データを再取得して最新の状態を反映
    const { data: placesData, error: placesError } = await supabase
      .from("places")
      .select("*")
      .eq("groupid", router.query.id);

    if (placesError) {
      console.error("Error fetching places:", placesError);
      return;
    }

    // アニメーション完了後にデータを更新
    setTimeout(() => {
      setPlacesToVisit(placesData.filter((p) => !p.visited));
      setVisitedPlaces(placesData.filter((p) => p.visited));
      setCheckedAnimationIndex(null);
      setOpenSnackbar(true);
    }, 800);
  };

  const handleToggleUnvisited = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const place = visitedPlaces[index];
    const updatedVisited = false;

    // データベースを更新
    const { error } = await supabase
      .from("places")
      .update({ visited: updatedVisited })
      .eq("id", place.id);

    if (error) {
      console.error("Error updating visited status:", error);
      return;
    }

    const updated = [...visitedPlaces];
    const [moved] = updated.splice(index, 1);
    moved.visited = updatedVisited;
    setVisitedPlaces(updated);
    setPlacesToVisit([...placesToVisit, moved]);
  };

  const handleToggleFavorite = async (
    index: number,
    visited: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const place = visited ? visitedPlaces[index] : placesToVisit[index];
    const updatedFavorite = !place.favorite;

    // データベースを更新
    const { error } = await supabase
      .from("places")
      .update({ favorite: updatedFavorite })
      .eq("id", place.id);

    if (error) {
      console.error("Error updating favorite status:", error);
      return;
    }

    if (visited) {
      const updatedVisited = [...visitedPlaces];
      updatedVisited[index].favorite = updatedFavorite;
      setVisitedPlaces(updatedVisited);
    } else {
      const updatedToVisit = [...placesToVisit];
      updatedToVisit[index].favorite = updatedFavorite;
      setPlacesToVisit(updatedToVisit);
    }
  };

  const handleTabChange = async (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);

    // タブが切り替わったときにデータを再取得
    const { id } = router.query;
    if (id) {
      const { data: placesData, error: placesError } = await supabase
        .from("places")
        .select("*")
        .eq("groupid", id);

      if (placesError) {
        console.error("Error fetching places:", placesError);
        return;
      }

      setPlacesToVisit(placesData.filter((place) => !place.visited));
      setVisitedPlaces(placesData.filter((place) => place.visited));
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const handleCardClick = (place: Place, index: number) => {
    setEditPlace(place);
    setEditIndex(index);
  };

  const handleEditChange = (field: keyof Place, value: string | boolean) => {
    if (editPlace) {
      setEditPlace({ ...editPlace, [field]: value });
    }
  };

  const handleEditSave = async () => {
    if (editPlace !== null && editIndex !== null) {
      // データベースを更新
      const { error } = await supabase
        .from("places")
        .update({
          title: editPlace.title,
          note: editPlace.note,
          url: editPlace.url,
          member: editPlace.member,
        })
        .eq("id", editPlace.id);

      if (error) {
        console.error("Error updating place:", error);
        return;
      }

      const updated = [...(editPlace.visited ? visitedPlaces : placesToVisit)];
      updated[editIndex] = editPlace;
      if (editPlace.visited) {
        setVisitedPlaces(updated);
      } else {
        setPlacesToVisit(updated);
      }
    }
    setEditPlace(null);
    setEditIndex(null);
  };

  const handleDelete = async () => {
    if (editIndex !== null && editPlace !== null) {
      // データベースから削除
      const { error } = await supabase
        .from("places")
        .delete()
        .eq("id", editPlace.id);

      if (error) {
        console.error("Error deleting place:", error);
        return;
      }

      if (editPlace.visited) {
        setVisitedPlaces(visitedPlaces.filter((_, i) => i !== editIndex));
      } else {
        setPlacesToVisit(placesToVisit.filter((_, i) => i !== editIndex));
      }
    }
    setEditPlace(null);
    setEditIndex(null);
  };

  const handleAddOrEditMember = async () => {
    if (newMember.trim() === "") {
      alert("メンバー名を入力してください。");
      return;
    }

    let updatedMembers = [...members];
    if (editIndex !== null) {
      // 編集モード
      updatedMembers[editIndex] = newMember;
      setEditIndex(null);
    } else {
      // 追加モード
      updatedMembers = [...members, newMember];
    }

    // データベースを更新
    const { error } = await supabase
      .from("groups")
      .update({ members: updatedMembers })
      .eq("id", router.query.id);

    if (error) {
      console.error("Error updating members:", error);
      return;
    }

    setMembers(updatedMembers);
    setNewMember("");
    setIsMemberDialogOpen(false);
  };

  const handleEditMember = (index: number) => {
    setNewMember(members[index]);
    setEditIndex(index);
    setIsMemberDialogOpen(true);
  };

  const handleDeleteMember = (index: number) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  // 共通のカードスタイルを関数化
  const getCardStyle = (isVisited: boolean, isFavorite: boolean) => ({
    borderRadius: "12px",
    backgroundColor: isFavorite
      ? "rgba(255, 248, 225, 0.6)" // お気に入り用の薄い黄色
      : isVisited
      ? "rgba(232, 245, 233, 0.6)" // 行った場所用の薄い緑
      : "rgba(232, 245, 253, 0.6)", // 行きたい場所用の薄い青
    backdropFilter: "blur(8px)",
    border: "1px solid",
    borderColor: isFavorite
      ? "rgba(255, 213, 79, 0.5)" // お気に入り用のボーダー
      : isVisited
      ? "rgba(200, 230, 201, 0.5)" // 行った場所用のボーダー
      : "rgba(200, 220, 240, 0.5)", // 行きたい場所用のボーダー
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      backgroundColor: isFavorite
        ? "rgba(255, 248, 225, 0.8)" // ホバー時の薄い黄色
        : isVisited
        ? "rgba(232, 245, 233, 0.8)" // ホバー時の薄い緑
        : "rgba(232, 245, 253, 0.8)", // ホバー時の薄い青
    },
  });

  // 共通のCardContentスタイルを更新
  const commonCardContentStyle = {
    py: 0.75,
    px: 1.25,
    "&:last-child": { pb: 0.75 },
    height: "100%", // 高さを統一
  };

  // 共通のListItemスタイルを更新
  const commonListItemStyle = {
    py: 0,
    px: 0,
    gap: 1,
    height: "100%", // 高さを統一
  };

  // すべてのタブで使用する共通のListItemTextコンポーネント
  const CommonListItemText = ({ place }: { place: Place }) => (
    <ListItemText
      primary={
        <Typography variant="body2" sx={commonTypographyStyle.primary}>
          {place.title}
        </Typography>
      }
      secondary={
        <Box sx={commonTypographyStyle.secondary}>
          <Box>{place.note}</Box>
          {place.url && (
            <Box>
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                style={commonTypographyStyle.url}
              >
                URL
              </a>
            </Box>
          )}
        </Box>
      }
    />
  );

  return (
    <Layout>
      <Box
        sx={{
          maxWidth: 800,
          background: "linear-gradient(145deg, #ffffff, #f0f7ff)",
          mx: "auto",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          px: 3,
          py: 2,
          boxShadow: "none",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {/* グループ名表示と編集 */}
        <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          {isEditingGroupName ? (
            <TextField
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onBlur={() => setIsEditingGroupName(false)}
              fullWidth
              size="small"
              autoFocus
              sx={{
                bgcolor: "#ffffff",
                borderRadius: 1,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
          ) : (
            <>
              <Typography variant="h6">{groupName}</Typography>
              <IconButton onClick={() => setIsEditingGroupName(true)}>
                <EditIcon />
              </IconButton>
            </>
          )}
        </Box>

        {/* 入力欄 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            mb: 1,
          }}
        >
          <Button
            onClick={toggleAccordion}
            disableRipple
            sx={{
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              "&:focus": {
                backgroundColor: "transparent",
              },
              "&:hover": {
                backgroundColor: "transparent",
              },
              "&:active": {
                backgroundColor: "transparent",
              },
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
            }}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            {isExpanded ? "隠す" : "表示"}
          </Button>
        </Box>
        <animated.div style={{ overflow: "hidden", ...animationProps }}>
          {isExpanded && (
            <Box
              component="form"
              sx={{
                mb: 1,
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 1,
              }}
            >
              <Stack spacing={1}>
                <TextField
                  label="行きたいところ・やりたいこと"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  size="small"
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.95)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                      },
                    },
                  }}
                  placeholder="例: 京都金閣寺"
                />
                <TextField
                  label="コメント or 詳細 (任意)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.95)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                      },
                    },
                  }}
                  placeholder="例: 紅葉が最高！写真映えスポットだよ"
                />
                <TextField
                  label="GoogleMapUrl or HP URL (任意)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.95)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                      },
                    },
                  }}
                  placeholder="例: https://www.shokoku-ji.jp/kinkakuji/"
                />
                <Select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value as string)}
                  displayEmpty
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiSelect-select": {
                      height: "2em",
                      padding: "6px 10px",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  <MenuItem value="" disabled sx={{ textAlign: "center" }}>
                    作成者を選択
                  </MenuItem>
                  {members.map((member, index) => (
                    <MenuItem key={index} value={member}>
                      {member}
                    </MenuItem>
                  ))}
                </Select>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsMemberDialogOpen(true)}
                    sx={{
                      bgcolor: "#a5d6a7",
                      "&:hover": {
                        bgcolor: "#81c784",
                      },
                      fontFamily: "'Kosugi Maru', sans-serif",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      textTransform: "none",
                      py: 0.5,
                      px: 2,
                    }}
                  >
                    メンバー管理
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddPlace}
                    sx={{
                      bgcolor: "#a5d6a7",
                      "&:hover": {
                        bgcolor: "#81c784",
                      },
                      fontFamily: "'Kosugi Maru', sans-serif",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      textTransform: "none",
                      py: 0.5,
                      px: 2,
                    }}
                  >
                    追加
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </animated.div>

        {/* タブとリスト */}
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          centered
          sx={{
            mb: 1,
            width: "100%",
            mx: "auto",
            "& .MuiTabs-flexContainer": {
              justifyContent: "space-between",
              mb: -1,
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px",
              backgroundColor: "#a5d6a7",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              minHeight: "40px",
              padding: "6px 8px",
              minWidth: "auto",
              flex: 1,
              borderRadius: "12px",
              color: "#666",
              whiteSpace: "nowrap",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              "&.Mui-selected": {
                color: "#2e7d32",
                backgroundColor: "rgba(165, 214, 167, 0.1)",
              },
            },
          }}
        >
          <Tab label="行きたい場所" />
          <Tab label="行った場所" />
          <Tab label="お気に入り" />
        </Tabs>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            borderTop: "2px solid #ccc",
            pb: 2,
          }}
        >
          {tabIndex === 0 && (
            <List>
              {placesToVisit.map((place, index) => (
                <Collapse
                  key={place.id}
                  in={true}
                  timeout={500}
                  sx={{
                    mb: 0.75,
                    transformOrigin: "top",
                  }}
                >
                  <Card
                    onClick={() => handleCardClick(place, index)}
                    sx={getCardStyle(false, place.favorite ?? false)}
                  >
                    <CardContent sx={commonCardContentStyle}>
                      <ListItem dense sx={commonListItemStyle}>
                        <CommonListItemText place={place} />
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.25,
                            minWidth: 80,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleToggleFavorite(index, false, e)
                              }
                            >
                              {place.favorite ? (
                                <StarIcon color="warning" fontSize="medium" />
                              ) : (
                                <StarBorderIcon fontSize="medium" />
                              )}
                            </IconButton>
                            <Checkbox
                              size="medium"
                              sx={{
                                color: "defaultColor",
                                "&.Mui-checked": {
                                  color: "#66bb6a",
                                },
                              }}
                              checked={checkedAnimationIndex === index}
                              className={
                                checkedAnimationIndex === index
                                  ? "checkmark-animation"
                                  : ""
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVisited(index, e);
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{
                              textAlign: "center",
                              fontFamily: "'Kosugi Maru', sans-serif",
                            }}
                          >
                            作成者: {place.member}
                          </Typography>
                        </Box>
                      </ListItem>
                    </CardContent>
                  </Card>
                </Collapse>
              ))}
            </List>
          )}

          {tabIndex === 1 && (
            <List>
              {visitedPlaces.map((place, index) => (
                <Collapse
                  key={place.id}
                  in={true}
                  timeout={500}
                  sx={{
                    mb: 0.75,
                    transformOrigin: "top",
                  }}
                >
                  <Card
                    onClick={() => handleCardClick(place, index)}
                    sx={getCardStyle(true, place.favorite ?? false)}
                  >
                    <CardContent sx={commonCardContentStyle}>
                      <ListItem dense sx={commonListItemStyle}>
                        <CommonListItemText place={place} />
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.25,
                            minWidth: 80,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleToggleFavorite(index, true, e)
                              }
                              disabled={true}
                            >
                              {place.favorite ? (
                                <StarIcon color="warning" fontSize="medium" />
                              ) : (
                                <StarBorderIcon fontSize="medium" />
                              )}
                            </IconButton>
                            <Checkbox
                              size="medium"
                              sx={{
                                color: "defaultColor",
                                "&.Mui-checked": {
                                  color: "#66bb6a",
                                },
                              }}
                              checked={true}
                              onClick={(e) => handleToggleUnvisited(index, e)}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{
                              textAlign: "center",
                              fontFamily: "'Kosugi Maru', sans-serif",
                            }}
                          >
                            作成者: {place.member}
                          </Typography>
                        </Box>
                      </ListItem>
                    </CardContent>
                  </Card>
                </Collapse>
              ))}
            </List>
          )}

          {tabIndex === 2 && (
            <List>
              {[...placesToVisit, ...visitedPlaces]
                .filter((place) => place.favorite)
                .map((place, index) => (
                  <Collapse
                    key={place.id}
                    in={true}
                    timeout={500}
                    sx={{
                      mb: 0.75,
                      transformOrigin: "top",
                    }}
                  >
                    <Card
                      onClick={() => handleCardClick(place, index)}
                      sx={getCardStyle(place.visited, place.favorite ?? false)}
                    >
                      <CardContent sx={commonCardContentStyle}>
                        <ListItem dense sx={commonListItemStyle}>
                          <CommonListItemText place={place} />
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 0.25,
                              minWidth: 80,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={(e) =>
                                  handleToggleFavorite(index, place.visited, e)
                                }
                              >
                                {place.favorite ? (
                                  <StarIcon color="warning" fontSize="medium" />
                                ) : (
                                  <StarBorderIcon fontSize="medium" />
                                )}
                              </IconButton>
                            </Box>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{
                                textAlign: "center",
                                fontFamily: "'Kosugi Maru', sans-serif",
                              }}
                            >
                              作成者: {place.member}
                            </Typography>
                          </Box>
                        </ListItem>
                      </CardContent>
                    </Card>
                  </Collapse>
                ))}
            </List>
          )}
        </Box>

        {/* 完了通知 */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            行った場所に追加されました！
          </Alert>
        </Snackbar>

        {/* 編集ダイアログ */}
        <Dialog
          open={editPlace !== null}
          onClose={() => setEditPlace(null)}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "20px",
              padding: "16px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.1)",
            },
          }}
        >
          <DialogTitle>編集</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="いきたいところ"
                value={editPlace?.title || ""}
                onChange={(e) => handleEditChange("title", e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="例: 東京タワー"
              />
              <TextField
                label="詳細 or メモ"
                value={editPlace?.note || ""}
                onChange={(e) => handleEditChange("note", e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="例: 展望台からの夜景が絶景で、特に冬のイルミネーションが美しい"
              />
              <TextField
                label="GoogleMap or HP URL"
                value={editPlace?.url || ""}
                onChange={(e) => handleEditChange("url", e.target.value)}
                fullWidth
                placeholder="例: https://www.tokyotower.co.jp/"
              />
              <Select
                value={editPlace?.member || ""}
                onChange={(e) => handleEditChange("member", e.target.value)}
                fullWidth
              >
                {members.map((member, index) => (
                  <MenuItem key={index} value={member}>
                    {member}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditPlace(null)}>キャンセル</Button>
            <Button color="error" onClick={handleDelete}>
              削除
            </Button>
            <Button variant="contained" onClick={handleEditSave}>
              保存
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isMemberDialogOpen}
          onClose={() => setIsMemberDialogOpen(false)}
          sx={{ "& .MuiDialog-paper": { margin: "auto", maxWidth: "400px" } }}
        >
          <DialogTitle>メンバー管理</DialogTitle>
          <DialogContent>
            <TextField
              label="メンバー名"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              fullWidth
              placeholder="例: 山田太郎"
            />
            <List>
              {members.map((member, index) => (
                <ListItem
                  key={index}
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <ListItemText primary={member} />
                  <Box>
                    <IconButton
                      onClick={() => handleEditMember(index)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteMember(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsMemberDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="contained" onClick={handleAddOrEditMember}>
              {editIndex !== null ? "保存" : "追加"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ListPage;
