import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
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

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AllReviewer = () => {
  const [teams, setTeams] = useState([]);
  const [data, setData] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, scoreRes] = await Promise.all([
          axios.get(`${BASE_URL}api/v1/teams/summary`),
          axios.get(`${BASE_URL}api/v1/scores/reviewer-all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTeams(teamRes.data);
        setData(scoreRes.data);
      } catch (err) {
        console.error("❌ 載入失敗", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const getReviewerScoreMap = (reviewerIndex) => {
    const scores = data[reviewerIndex]?.scores || [];
    const map = {};
    scores.forEach((s) => {
      map[s.team_id] = s;
    });
    return map;
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/v1/scores/reviewer-export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `評審評分報表_${new Date().toISOString().slice(0, 10)}.xlsx`;

      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ 匯出失敗", err);
      alert("匯出失敗，請稍後再試");
    }
  };

  const renderScore = (value) =>
    value !== undefined ? (
      <Typography align="right">{value}</Typography>
    ) : (
      <Typography color="error" align="right">尚未評分</Typography>
    );

  return (
    <div className="AllReviewer">
      <div className="title">
        <Title title="委員評分資訊" />
      </div>
      <hr />

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleDownload}>
          下載 Excel
        </Button>
      </Stack>

      {loading ? (
        <Typography sx={{ p: 4 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          載入中...
        </Typography>
      ) : (
        <>
          <Tabs
            value={selectedReviewer}
            onChange={(e, newValue) => setSelectedReviewer(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            {data.map((reviewer, index) => (
              <Tab
                key={reviewer.reviewer_id}
                label={`${reviewer.reviewer_name}（ID: ${reviewer.reviewer_id}）`}
              />
            ))}
          </Tabs>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#1976d2" }}>
                  {["隊伍 ID", "隊伍名稱", "專題名稱", "技術", "創新", "設計", "創造價值", "總分"].map((text, i) => (
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
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map((team) => {
                  const scoreMap = getReviewerScoreMap(selectedReviewer);
                  const score = scoreMap[team.id];

                  const technical = score?.technical;
                  const innovation = score?.innovation;
                  const design = score?.design;
                  const value_creation = score?.value_creation;

                  const hasAllScores =
                    technical !== undefined &&
                    innovation !== undefined &&
                    design !== undefined &&
                    value_creation !== undefined;

                  const totalScore = hasAllScores
                    ? ((technical + innovation + design + value_creation) * 0.25).toFixed(2)
                    : "0.00";

                  return (
                    <TableRow key={team.id}>
                      <TableCell>{team.id}</TableCell>
                      <TableCell>{team.team_name}</TableCell>
                      <TableCell>{team.project_title}</TableCell>
                      <TableCell align="right">{renderScore(technical)}</TableCell>
                      <TableCell align="right">{renderScore(innovation)}</TableCell>
                      <TableCell align="right">{renderScore(design)}</TableCell>
                      <TableCell align="right">{renderScore(value_creation)}</TableCell>
                      <TableCell align="right">
                        {hasAllScores ? (
                          totalScore
                        ) : (
                          <Typography color="error" align="right">0.00</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default AllReviewer;
