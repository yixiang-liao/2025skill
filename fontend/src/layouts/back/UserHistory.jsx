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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 套用 plugin
dayjs.extend(utc);
dayjs.extend(timezone);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#1976d2", // 藍色
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

const UserHistory = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}api/v1/admin/vote/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => setRows(res.data))
      .catch((err) => console.error("取得歷史資料失敗", err));
  }, []);

  const formatTaipeiTime = (utcString) => {
    return dayjs.utc(utcString).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm");
  };

  return (
    <div className="UserHistory">
      <div className="title">
        <Title title="使用者投票紀錄" />
      </div>
      <hr />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1000 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>時間（台北）</StyledTableCell>
              <StyledTableCell>使用者帳號</StyledTableCell>
              <StyledTableCell>姓名</StyledTableCell>
              <StyledTableCell>科系</StyledTableCell>
              <StyledTableCell>狀態</StyledTableCell>
              <StyledTableCell>第一票</StyledTableCell>
              <StyledTableCell>第二票</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <StyledTableRow key={i}>
                <StyledTableCell>{formatTaipeiTime(row.latest_time)}</StyledTableCell>
                <StyledTableCell>{row.user_id}</StyledTableCell>
                <StyledTableCell>{row.name}</StyledTableCell>
                <StyledTableCell>{row.department}</StyledTableCell>
                <StyledTableCell>{row.status}</StyledTableCell>
                <StyledTableCell>{row.vote1}</StyledTableCell>
                <StyledTableCell>{row.vote2}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UserHistory;