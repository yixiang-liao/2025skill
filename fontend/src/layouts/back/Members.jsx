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


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 樣式設定
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

const Members = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/v1/teams/members`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => setRows(res.data))
      .catch((err) => console.error("取得團隊成員資料失敗", err));
  }, []);

  return (
    <div className="Members">
      <div className="title">
        <Title title="團隊成員資料" />
      </div>
      <hr />

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table sx={{ minWidth: 1000 }} aria-label="members table">
          <TableHead>
            <TableRow>
              <StyledTableCell>組別 ID</StyledTableCell>
              <StyledTableCell>隊伍名稱</StyledTableCell>
              <StyledTableCell>組長</StyledTableCell>
              <StyledTableCell>組員 1</StyledTableCell>
              <StyledTableCell>組員 2</StyledTableCell>
              <StyledTableCell>組員 3</StyledTableCell>
              <StyledTableCell>指導老師 1</StyledTableCell>
              <StyledTableCell>指導老師 2</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(rows) &&
              rows.map((row, i) => (
                <StyledTableRow key={i}>
                  <StyledTableCell>{row.team_id}</StyledTableCell>
                  <StyledTableCell>{row.team_name}</StyledTableCell>
                  <StyledTableCell>{row.leader}</StyledTableCell>
                  <StyledTableCell>{row.member_1}</StyledTableCell>
                  <StyledTableCell>{row.member_2}</StyledTableCell>
                  <StyledTableCell>{row.member_3}</StyledTableCell>
                  <StyledTableCell>{row.instructor_1}</StyledTableCell>
                  <StyledTableCell>{row.instructor_2}</StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Members;