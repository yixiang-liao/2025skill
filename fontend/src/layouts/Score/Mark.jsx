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
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Mark = () => {
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          console.warn("⚠️ 尚未登入，請確認 localStorage 中有 token");
          setLoading(false);
          return;
        }

        const [teamRes, scoreRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/v1/teams/summary`),
          axios.get(`${BASE_URL}/api/v1/scores/by-user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTeams(teamRes.data);

        const scoreMap = {};
        scoreRes.data.forEach((score) => {
          scoreMap[score.team_id] = {
            technical: score.technical,
            design: score.design,
            value_creation: score.value_creation,
            innovation: score.innovation,
            submitted: true,
            id: score.id,
            editMode: false,
          };
        });
        setScores(scoreMap);
      } catch (err) {
        console.error("❌ 載入失敗", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (teamId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [field]: Number(value),
      },
    }));
  };

  const validateScores = (score) => {
    const fields = ["technical", "design", "value_creation", "innovation"];
    return fields.every((field) => score[field] >= 0 && score[field] <= 100);
  };

  const handleSave = async (teamId) => {
    const score = scores[teamId];
    if (!score) return alert("請填寫分數");

    if (!validateScores(score)) {
      alert("分數請在 0~100 之間");
      return;
    }

    const payload = {
      team_id: teamId,
      technical: score.technical,
      design: score.design,
      value_creation: score.value_creation,
      innovation: score.innovation,
    };

    const postUrl = `${BASE_URL}/api/v1/scores/score`;
    const putUrl = `${BASE_URL}/api/v1/scores/${score.id}`;
    const endpoint = score.submitted ? putUrl : postUrl;
    const method = score.submitted ? "put" : "post";

    try {
      const res = await axios[method](endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setScores((prev) => ({
        ...prev,
        [teamId]: {
          ...score,
          submitted: true,
          editMode: false,
          id: res.data.id,
        },
      }));

      alert(score.submitted ? "更新成功！" : "評分成功！");
    } catch (err) {
      alert("操作失敗：" + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="Mark">
      <div className="title">
        <Title title="評分表" />
      </div>
      <hr />

      {loading ? (
        <Typography sx={{ p: 4 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          資料載入中...
        </Typography>
      ) : teams.length === 0 ? (
        <Typography sx={{ p: 4 }}>🚧 尚無隊伍資料</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>隊伍編號</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>隊伍名稱</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>專題名稱</TableCell>
                {["技術", "設計", "創造價值", "創新", "總計"].map((text, i) => (
                  <TableCell
                    key={i}
                    sx={{ color: "white", fontWeight: "bold", textAlign: "right" }}
                  >
                    {text}
                  </TableCell>
                ))}
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => {
                const score = scores[team.id] || {};
                const submitted = score.submitted;
                const editMode = score.editMode;

                const total =
                  ((score.technical || 0) +
                    (score.design || 0) +
                    (score.value_creation || 0) +
                    (score.innovation || 0)) *
                  0.25;

                return (
                  <TableRow
                    key={team.id}
                    sx={{ backgroundColor: submitted ? "#e8f5e9" : "inherit" }}
                  >
                    <TableCell>{team.id}</TableCell>
                    <TableCell>{team.team_name}</TableCell>
                    <TableCell>
                      <a
                        href={`/2025skill/Popularity/CasePage/${team.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1976d2", textDecoration: "underline", fontWeight: "bold" }}
                      >
                        {team.project_title}
                      </a>
                    </TableCell>

                    {["technical", "design", "value_creation", "innovation"].map((field) => (
                      <TableCell key={field} align="right">
                        {submitted && !editMode ? (
                          <Typography>{score[field]}</Typography>
                        ) : (
                          <TextField
                            type="number"
                            size="small"
                            value={score[field] || ""}
                            onChange={(e) => handleChange(team.id, field, e.target.value)}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        )}
                      </TableCell>
                    ))}

                    <TableCell align="right">
                      {isNaN(total) ? "-" : total.toFixed(2)}
                    </TableCell>

                    <TableCell>
                      {submitted && !editMode ? (
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          onClick={() =>
                            setScores((prev) => ({
                              ...prev,
                              [team.id]: {
                                ...prev[team.id],
                                editMode: true,
                              },
                            }))
                          }
                        >
                          更新
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ backgroundColor: "#9c27b0" }}
                          onClick={() => handleSave(team.id)}
                        >
                          儲存
                        </Button>
                      )}
                    </TableCell>
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

export default Mark;
