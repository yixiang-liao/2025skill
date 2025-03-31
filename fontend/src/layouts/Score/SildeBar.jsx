import React, { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import LOGO_2 from "../../assets/LOGO_2.png";
import { logout, getMe } from "../../services/SSO/auth";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";

const MySidebar = ({ onSelect }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  // 取得目前登入者資訊
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getMe();
        setUsername(user.username);
        setRole(user.role); // ⬅️ 新增
      } catch {
        setUsername("");
        setRole("");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/loginpage"); // 根據你的路由，這裡改為小寫 login
  };

  const handleOpenRankDialog = () => setOpenDialog(true);
  const handleCloseRankDialog = () => setOpenDialog(false);

  return (
    <div style={{ height: "100vh" }} className="my-sidebar">
      <Sidebar>
        <Menu
          menuItemStyles={{
            button: {
              // the active class will be added automatically by react router
              // so we can use it to style the active menu item
              [`&.active`]: {
                backgroundColor: "#13395e",
                color: "#b6c8d9",
              },
            },
          }}
        >
          <div className="header">
            <img src={LOGO_2} className="logo" />
            <div className="title">
              2025技優成果競賽
              <br />
              評分系統
            </div>
          </div>
          <hr />
          <p className="user-name">Hi, {username || ""} 委員</p>
          {/* <MenuItem component={<Link to="#" />}>團隊資料管理</MenuItem> */}
          <MenuItem onClick={() => onSelect("Mark")}>團隊評分</MenuItem>
          <MenuItem onClick={() => onSelect("ThisMark")}>評分紀錄</MenuItem>
          <MenuItem onClick={handleOpenRankDialog}>參考級距</MenuItem>
          <MenuItem onClick={handleLogout}>登出</MenuItem>
          {/* <MenuItem component={<Link to="/" />}> Documentation</MenuItem>
          <MenuItem component={<Link to="/" />}> Calendar</MenuItem>
          <MenuItem component={<Link to="/e-" />}> E-commerce</MenuItem>
          <SubMenu label="Charts">
            <MenuItem> Pie charts </MenuItem>
            <MenuItem> Line charts </MenuItem>
          </SubMenu>
          <MenuItem> Documentation </MenuItem>
          <MenuItem> Calendar </MenuItem> */}
        </Menu>
      </Sidebar>

      {/* 📊 級距對照視窗 */}
      <Dialog open={openDialog} onClose={handleCloseRankDialog}>
        <DialogTitle>評分參考級距</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {[
                ["A+", "95 ~ 100"],
                ["A", "90 ~ 95"],
                ["B+", "85 ~ 90"],
                ["B", "80 ~ 85"],
                ["C+", "75 ~ 80"],
                ["C", "70 ~ 75"],
              ].map(([grade, range]) => (
                <TableRow key={grade}>
                  <TableCell>
                    <Typography fontWeight="bold">{grade}</Typography>
                  </TableCell>
                  <TableCell>{range}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MySidebar;
