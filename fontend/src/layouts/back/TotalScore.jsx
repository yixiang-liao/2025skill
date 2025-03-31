import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import Title from "../../components/back/Title";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TotalScore = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/scores/team-ranking`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScores(res.data);
      } catch (err) {
        console.error("❌ 載入失敗", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchScores();
  }, [token]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      scores.map((score) => ({
        "隊伍 ID": score.team_id,
        "隊伍名稱": score.team_name,
        "專題名稱": score.project_title,
        "技術": score.technical_avg.toFixed(2),
        "創新": score.innovation_avg.toFixed(2),
        "設計": score.design_avg.toFixed(2),
        "創造價值": score.value_creation_avg.toFixed(2),
        "總分": score.total_score.toFixed(5),
        "排名": score.rank,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "團隊總分排名");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, `團隊總分排名_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="total-score">
      <div className="title">
        <Title title="團隊總分" />
      </div>
      <hr />

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={exportToExcel}>
          下載 Excel
        </Button>
      </Stack>

      {loading ? (
        <Typography sx={{ p: 4 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          資料載入中...
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                {["隊伍 ID", "隊伍名稱", "專題名稱", "技術", "創新", "設計", "創造價值", "總分", "排名"].map(
                  (text, i) => (
                    <TableCell
                      key={i}
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        textAlign: i >= 3 ? "right" : "left",
                      }}
                    >
                      {text}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map((score) => (
                <TableRow key={score.team_id}>
                  <TableCell>{score.team_id}</TableCell>
                  <TableCell>{score.team_name}</TableCell>
                  <TableCell>{score.project_title}</TableCell>
                  <TableCell align="right">{score.technical_avg.toFixed(2)}</TableCell>
                  <TableCell align="right">{score.innovation_avg.toFixed(2)}</TableCell>
                  <TableCell align="right">{score.design_avg.toFixed(2)}</TableCell>
                  <TableCell align="right">{score.value_creation_avg.toFixed(2)}</TableCell>
                  <TableCell align="right">{score.total_score.toFixed(5)}</TableCell>
                  <TableCell align="right">{score.rank}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default TotalScore;
