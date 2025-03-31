import React, { useEffect, useState } from "react";
import Title from "../../components/back/Title";
import axios from "axios";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DeleteIcon from "@mui/icons-material/Delete";


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

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', confirm: '', role: 'user' });
  const [openDialog, setOpenDialog] = useState(false);

  const fetchUsers = () => {
    axios
      .get(`${BASE_URL}/api/v1/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => {
        const roleOrder = { admin: 0, user: 1, reviewer: 2 };
        const sorted = [...res.data].sort(
          (a, b) => roleOrder[a.role] - roleOrder[b.role]
        );
        setUsers(sorted);
      })
      .catch((err) => console.error("取得使用者列表失敗", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (username) => {
    if (window.confirm(`確定要刪除 ${username} 嗎？`)) {
      axios
        .delete(`${BASE_URL}/api/v1/admin/delete-user/${username}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        .then(() => fetchUsers())
        .catch((err) => alert("刪除失敗"));
    }
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.confirm) return alert("請填寫所有欄位");
    if (newUser.password !== newUser.confirm) return alert("密碼不一致");

    axios
      .post(`${BASE_URL}/api/v1/admin/register`, {
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then(() => {
        alert("新增成功");
        setNewUser({ username: '', password: '', confirm: '', role: 'user' });
        setOpenDialog(false);
        fetchUsers();
      })
      .catch((err) => alert("新增失敗"));
  };

  return (
    <div className="RoleManagement">
      <div className="title">
        <Title title="後台權限管理" />
      </div>
      <hr />

      <Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={() => setOpenDialog(true)}>
        新增使用者
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>新增使用者</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="使用者姓名" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
            <TextField label="密碼" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <TextField label="確認密碼" type="password" value={newUser.confirm} onChange={e => setNewUser({ ...newUser, confirm: e.target.value })} />
            <Select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
              <MenuItem value="user">工作人員</MenuItem>
              <MenuItem value="reviewer">評審</MenuItem>
              <MenuItem value="admin">管理員</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button variant="contained" onClick={handleAddUser}>新增</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 600 }} aria-label="role table">
          <TableHead>
            <TableRow>
              <StyledTableCell>使用者姓名</StyledTableCell>
              <StyledTableCell>角色</StyledTableCell>
              <StyledTableCell>操作</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) &&
              users.map((user, i) => (
                <StyledTableRow key={i}>
                  <StyledTableCell>{user.username}</StyledTableCell>
                  <StyledTableCell>{user.role_name}</StyledTableCell>
                  <StyledTableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(user.username)}
                    >
                      刪除
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default RoleManagement;