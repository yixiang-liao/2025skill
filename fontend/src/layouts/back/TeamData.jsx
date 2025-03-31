import React, { useEffect, useState } from "react";
import axios from "axios";
import Title from "../../components/back/Title";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#1976d2",
    color: theme.palette.common.white,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const TeamData = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dialogType, setDialogType] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");

  const fetchTeams = () => {
    axios
      .get(`${BASE_URL}/api/v1/teams/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => setTeams(res.data))
      .catch((err) => console.error("載入團隊資料失敗", err));
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    if (file && dialogType === "image") {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedTeam || !dialogType) return;

    const formData = new FormData();
    formData.append("file", file);

    const endpoint =
      dialogType === "poster"
        ? `/api/v1/teams/${selectedTeam.id}/upload-poster`
        : `/api/v1/teams/${selectedTeam.id}/upload-image`;

    try {
      await axios.post(`${BASE_URL}${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      fetchTeams();
      setSnackbarMsg("上傳成功");
      setSnackbarType("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("上傳失敗", err);
      setSnackbarMsg("上傳失敗");
      setSnackbarType("error");
      setSnackbarOpen(true);
    }

    setFile(null);
    setPreviewUrl("");
    setSelectedTeam(null);
    setDialogType("");
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("確定要刪除這個隊伍的圖片與海報嗎？")) return;
    try {
      await axios.delete(`${BASE_URL}/api/v1/teams/${teamId}/assets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      fetchTeams();
      setSnackbarMsg("刪除成功");
      setSnackbarType("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("刪除失敗", err);
      setSnackbarMsg("刪除失敗");
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="team-data">
      <div className="title">
        <Title title="團隊多媒體資料管理" />
      </div>
      <hr />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>編號</StyledTableCell>
              <StyledTableCell>團隊名稱</StyledTableCell>
              <StyledTableCell>專題名稱</StyledTableCell>
              <StyledTableCell>專題領域</StyledTableCell>
              <StyledTableCell align="center">編輯海報</StyledTableCell>
              <StyledTableCell align="center">編輯圖片</StyledTableCell>
              <StyledTableCell align="center">刪除多媒體</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => (
              <StyledTableRow key={team.id}>
                <StyledTableCell>{team.id}</StyledTableCell>
                <StyledTableCell>{team.team_name}</StyledTableCell>
                <StyledTableCell>{team.project_title}</StyledTableCell>
                <StyledTableCell>{team.theme_category}</StyledTableCell>
                <StyledTableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedTeam(team);
                      setDialogType("poster");
                      setPreviewUrl(
                        team.png_url
                          ? `${BASE_URL}${team.png_url}`
                          : ""
                      );
                    }}
                  >
                    {team.pdf_url ? "編輯海報" : "上傳海報"}
                  </Button>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedTeam(team);
                      setDialogType("image");
                      setPreviewUrl(
                        team.img_url
                          ? `${BASE_URL}${team.img_url}`
                          : ""
                      );
                    }}
                  >
                    {team.img_url ? "編輯圖片" : "上傳圖片"}
                  </Button>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => handleDelete(team.id)}
                  >
                    刪除多媒體
                  </Button>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={Boolean(selectedTeam && dialogType)}
        onClose={() => {
          setSelectedTeam(null);
          setFile(null);
          setPreviewUrl("");
        }}
      >
        <DialogTitle>
          {dialogType === "poster" ? "編輯海報" : "編輯圖片"}
        </DialogTitle>
        <DialogContent>
          {previewUrl && (
            <div style={{ marginBottom: "10px" }}>
              {/* 預覽圖片可加回來 */}
            </div>
          )}

          <input
            type="file"
            accept={dialogType === "poster" ? ".pdf" : "image/*"}
            onChange={handleFileChange}
          />
          {file && dialogType === "poster" && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              已選檔案：{file.name}
            </Typography>
          )}
          {file && dialogType === "image" && (
            <img
              src={URL.createObjectURL(file)}
              alt="新預覽"
              style={{ maxWidth: "100%", marginTop: "10px" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTeam(null)}>取消</Button>
          <Button onClick={handleUpload} disabled={!file} variant="contained">
            更新
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarType}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TeamData;
