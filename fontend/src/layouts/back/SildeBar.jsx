import React, { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import LOGO_2 from "../../assets/LOGO_2.png";
import { logout, getMe } from "../../services/SSO/auth";

const MySidebar = ({ onSelect }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

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
              賽務資訊系統
            </div>
          </div>
          <hr />
          <p className="user-name">Hi, {username || ""}</p>
          {/* <MenuItem component={<Link to="#" />}>團隊資料管理</MenuItem> */}
          <SubMenu label="團隊管理">
            <MenuItem onClick={() => onSelect("ExcelUploader")}>
              團隊資料上傳
            </MenuItem>
            <MenuItem onClick={() => onSelect("Members")}>
              團隊成員資料
            </MenuItem>
            <MenuItem onClick={() => onSelect("TeamData")}>
              團隊多媒體資料管理
            </MenuItem>
            {role === "admin" && (
              <MenuItem onClick={() => onSelect("AllReviewer")}>
                委員評分資訊
              </MenuItem>
            )}
            {role === "admin" && (
              <MenuItem onClick={() => onSelect("TotalScore")}>
                團隊總分排名
              </MenuItem>
            )}
          </SubMenu>
          <SubMenu label="最佳人氣獎">
            {role === "admin" && (
              <MenuItem onClick={() => onSelect("VoteTimeConfig")}>
                最佳人氣獎時間設定
              </MenuItem>
            )}
            {role === "admin" && (
              <MenuItem onClick={() => onSelect("UserHistory")}>
                使用者投票紀錄
              </MenuItem>
            )}
            <MenuItem onClick={() => onSelect("AdminRankTable")}>
              目前排名
            </MenuItem>
          </SubMenu>
          <SubMenu label="後台帳號管理">
            {role === "admin" && (
              <MenuItem onClick={() => onSelect("RoleManagement")}>
                後台權限管理
              </MenuItem>
            )}
            <MenuItem onClick={() => onSelect("ChangePassword")}>
              更新密碼
            </MenuItem>
          </SubMenu>
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
    </div>
  );
};

export default MySidebar;
