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
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import "../styles.css"; // CSSファイルをインポート
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
    const { error } = await supabase
      .from("places")
      .insert([{ ...newPlace, groupid: groupId }]);

    if (error) {
      console.error("Error adding place:", error);
      return;
    }

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
    const updatedVisited = true;

    // データベースを更新
    const { error } = await supabase
      .from("places")
      .update({ visited: updatedVisited })
      .eq("id", place.id);

    if (error) {
      console.error("Error updating visited status:", error);
      return;
    }

    // ローカルの状態を即時更新
    setTimeout(() => {
      const updated = [...placesToVisit];
      const [moved] = updated.splice(index, 1);
      moved.visited = updatedVisited;
      setPlacesToVisit(updated);
      setVisitedPlaces((prev) => [...prev, moved]);
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

  return (
    <Layout>
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          height: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
          px: 2,
          py: 1,
        }}
      >
        {/* グループ名表示と編集 */}
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          {isEditingGroupName ? (
            <TextField
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onBlur={() => setIsEditingGroupName(false)}
              fullWidth
              size="small"
              autoFocus
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
          component="form"
          sx={{ mb: 2, border: "1px solid #ccc", borderRadius: 2, p: 2 }}
        >
          <Stack spacing={2}>
            <TextField
              label="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="メモ"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
              size="small"
            />
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value as string)}
              displayEmpty
              fullWidth
              size="small"
            >
              <MenuItem value="" disabled>
                メンバーを選択
              </MenuItem>
              {members.map((member, index) => (
                <MenuItem key={index} value={member}>
                  {member}
                </MenuItem>
              ))}
            </Select>
            <Box textAlign="right">
              <Button
                variant="contained"
                onClick={handleAddPlace}
                size="small"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#ffb6b9",
                  ":hover": {
                    backgroundColor: "#ff8fa3",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                追加
              </Button>
            </Box>
          </Stack>
        </Box>

        {/* タブとリスト */}
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label="行きたい場所" />
          <Tab label="行った場所" />
          <Tab label="お気に入り" />
        </Tabs>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            borderTop: "2px solid #ccc",
            pt: 2,
          }}
        >
          {tabIndex === 0 && (
            <List>
              {placesToVisit.map((place, index) => (
                <Collapse key={place.title} in={true} timeout={300}>
                  <Card
                    onClick={() => handleCardClick(place, index)}
                    sx={{
                      mb: 1,
                      boxShadow: 2,
                      backgroundColor: "#ffe4e1",
                      cursor: "pointer",
                      height: 100,
                    }}
                  >
                    <CardContent
                      sx={{
                        py: 0.5,
                        px: 1.5,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "100%",
                      }}
                    >
                      <ListItem
                        dense
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: "bold",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                mb: 0.5,
                              }}
                            >
                              {place.title}
                            </Typography>
                          }
                          secondary={
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <Box sx={{ mb: 0.5 }}>
                                {place.note && `${place.note}`}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mt: 0.25,
                                }}
                              >
                                <Box>
                                  {place.url && (
                                    <a
                                      href={place.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      URL
                                    </a>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          }
                        />
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
                                <StarIcon color="warning" fontSize="small" />
                              ) : (
                                <StarBorderIcon fontSize="small" />
                              )}
                            </IconButton>
                            <Checkbox
                              size="small"
                              color="primary"
                              checked={checkedAnimationIndex === index}
                              className={
                                checkedAnimationIndex === index
                                  ? "checkmark-animation"
                                  : ""
                              }
                              onClick={(e) => handleToggleVisited(index, e)}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ textAlign: "center" }}
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
                <Card
                  onClick={() => handleCardClick(place, index)}
                  key={index}
                  sx={{
                    mb: 1,
                    boxShadow: 1,
                    backgroundColor: "#e8f5e9",
                    cursor: "pointer",
                    height: 120,
                  }}
                >
                  <CardContent
                    sx={{
                      py: 1,
                      px: 2,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}
                  >
                    <ListItem
                      dense
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: "bold",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              mb: 1,
                            }}
                          >
                            {place.title}
                          </Typography>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              {place.note && `${place.note}`}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 0.5,
                              }}
                            >
                              <Box>
                                {place.url && (
                                  <a
                                    href={place.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    URL
                                  </a>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 0.5,
                          minWidth: 100,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <IconButton
                            onClick={(e) =>
                              handleToggleFavorite(index, true, e)
                            }
                            disabled={true}
                          >
                            {place.favorite ? (
                              <StarIcon color="warning" />
                            ) : (
                              <StarBorderIcon />
                            )}
                          </IconButton>
                          <Checkbox
                            color="primary"
                            checked={true}
                            onClick={(e) => handleToggleUnvisited(index, e)}
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ textAlign: "center" }}
                        >
                          作成者: {place.member}
                        </Typography>
                      </Box>
                    </ListItem>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}

          {tabIndex === 2 && (
            <List>
              {[...placesToVisit, ...visitedPlaces]
                .filter((place) => place.favorite)
                .map((place, index) => (
                  <Card
                    onClick={() => handleCardClick(place, index)}
                    key={index}
                    sx={{
                      mb: 1,
                      boxShadow: 1,
                      backgroundColor: place.favorite ? "#fff9c4" : "#f0f4c3",
                      cursor: "pointer",
                      height: 120,
                    }}
                  >
                    <CardContent
                      sx={{
                        py: 1,
                        px: 2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "100%",
                      }}
                    >
                      <ListItem
                        dense
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: "bold",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                mb: 1,
                              }}
                            >
                              {place.title}
                            </Typography>
                          }
                          secondary={
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <Box sx={{ mb: 1 }}>
                                {place.note && `${place.note}`}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mt: 0.5,
                                }}
                              >
                                <Box>
                                  {place.url && (
                                    <a
                                      href={place.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      URL
                                    </a>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          }
                        />
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.5,
                            minWidth: 100,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              onClick={(e) =>
                                handleToggleFavorite(index, place.visited, e)
                              }
                            >
                              {place.favorite ? (
                                <StarIcon color="warning" />
                              ) : (
                                <StarBorderIcon />
                              )}
                            </IconButton>
                          </Box>
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ textAlign: "center" }}
                          >
                            作成者: {place.member}
                          </Typography>
                        </Box>
                      </ListItem>
                    </CardContent>
                  </Card>
                ))}
            </List>
          )}
        </Box>

        {/* 完了通知 */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
          sx={{ "& .MuiDialog-paper": { margin: "auto", maxWidth: "500px" } }}
        >
          <DialogTitle>編集</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="タイトル"
                value={editPlace?.title || ""}
                onChange={(e) => handleEditChange("title", e.target.value)}
                fullWidth
              />
              <TextField
                label="メモ"
                value={editPlace?.note || ""}
                onChange={(e) => handleEditChange("note", e.target.value)}
                fullWidth
              />
              <TextField
                label="URL"
                value={editPlace?.url || ""}
                onChange={(e) => handleEditChange("url", e.target.value)}
                fullWidth
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
      </Box>
    </Layout>
  );
};

export default ListPage;
