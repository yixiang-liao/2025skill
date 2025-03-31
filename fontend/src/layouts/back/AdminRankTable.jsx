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

const AdminRankTable = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/v1/ranking`)
      .then((res) => setRows(res.data))
      .catch((err) => console.error("取得排名資料失敗", err));
  }, []);

  return (
    <div className="AdminRankTable">
      <div className="title">
        <Title title="目前排名" />
      </div>
      <hr />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }} aria-label="ranking table">
          <TableHead>
            <TableRow>
              <StyledTableCell>排名</StyledTableCell>
              <StyledTableCell>隊伍名稱</StyledTableCell>
              <StyledTableCell>專題名稱</StyledTableCell>
              <StyledTableCell align="right">票數</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <StyledTableRow key={row.team_id}>
                <StyledTableCell>{row.rank}</StyledTableCell>
                <StyledTableCell>{row.team_name}</StyledTableCell>
                <StyledTableCell>{row.project_title}</StyledTableCell>
                <StyledTableCell align="right">{row.vote_count}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AdminRankTable;
