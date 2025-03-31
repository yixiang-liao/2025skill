import React, { useEffect, useState } from "react";
import axios from "axios";
import Title from "../../components/Popularity/Title";
import BasicExample from "../../layouts/Popularity/NavBar";
import Footer from "../../layouts/Popularity/Footer";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RankTable = () => {
  const [rankingData, setRankingData] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}api/v1/ranking`)
      .then((res) => setRankingData(res.data))
      .catch((err) => console.error("載入排名資料失敗", err));
  }, []);

  return (
    <div className="RankTable">
      <BasicExample />
      <div className="header">
        <Title title="即時排名" eng_title="Real-time ranking" />
      </div>
      <div className="content">
        <table className="ranking-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>隊伍名稱</th>
              <th>專題名稱</th>
              <th>票數</th>
            </tr>
          </thead>
          <tbody>
            {rankingData.map((item) => (
              <tr key={item.team_id}>
                <td># {item.rank}</td>
                <td>{item.team_name}</td>
                <td>{item.project_title}</td>
                <td>{item.vote_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
};

export default RankTable;
