import React, { useEffect, useState } from "react";
import Title from "../../components/back/Title";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress
} from "@mui/material";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ThisMark = () => {
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 取得所有隊伍
        const teamRes = await axios.get(`${BASE_URL}/api/v1/teams/summary`);
        setTeams(teamRes.data);

        // 取得目前登入者評分紀錄
        const scoreRes = await axios.get(`${BASE_URL}/api/v1/scores/by-user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 將評分結果轉成 map 方便查找
        const scoreMap = {};
        scoreRes.data.forEach(score => {
          scoreMap[score.team_id] = score;
        });
        setScores(scoreMap);
      } catch (err) {
        console.error("❌ 載入資料失敗", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const renderCell = (value) => (
    <Typography color={value === 0 ? "error" : "inherit"}>
      {value}
    </Typography>
  );

  return (
    <div className="this-mark">
      <div className="title">
        <Title title="評分紀錄" />
      </div>
      <hr />

      {loading ? (
        <Typography sx={{ p: 4 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          載入中...
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                {["隊伍 ID", "隊伍名稱", "專題名稱", "技術", "創新", "設計", "創造價值", "總分"].map((text, i) => (
                  <TableCell key={i} align={i >= 3 ? "right" : "left"} sx={{ color: "white", fontWeight: "bold" }}>{text}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => {
                const score = scores[team.id];
                const technical = score?.technical || 0;
                const innovation = score?.innovation || 0;
                const design = score?.design || 0;
                const value_creation = score?.value_creation || 0;
                const total = score?.total_score || 0;

                return (
                  <TableRow key={team.id}>
                    <TableCell>{team.id}</TableCell>
                    <TableCell>{team.team_name}</TableCell>
                    <TableCell>
                      <a
                        href={`/Popularity/CasePage/${team.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1976d2", textDecoration: "underline", fontWeight: "bold" }}
                      >
                        {team.project_title}
                      </a></TableCell>
                    <TableCell align="right">{renderCell(technical)}</TableCell>
                    <TableCell align="right">{renderCell(innovation)}</TableCell>
                    <TableCell align="right">{renderCell(design)}</TableCell>
                    <TableCell align="right">{renderCell(value_creation)}</TableCell>
                    <TableCell align="right">{renderCell(total.toFixed(2))}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default ThisMark;
