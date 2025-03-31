import React, { useEffect, useState } from "react";
import axios from "axios";
import Title from "../../components/Popularity/Title";
import Case from "../../components/Popularity/Case";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CaseBox = ({ themeCode }) => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(`${BASE_URL}/api/v1/open/theme?code=${themeCode}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("載入資料失敗", err));
  }, [themeCode]);

  const filtered = data.filter((d) =>
    d.project_title.includes(search) || d.team_name.includes(search)
  );

  return (
    <div className="CaseBox">
      <div className="header">
        <Title title="參賽作品" eng_title="Competition Entries" />
        <div className="search">
          <input
            type="text"
            placeholder="輸入作品或隊伍名稱"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>搜尋</button>
        </div>
      </div>
      <div className="box">
        {filtered.map((item) => (
          <Case
            key={item.team_id}
            team_id={item.team_id}
            poster_img={item.poster_img}
            theme_category={item.theme_category}
            project_title={item.project_title}
            team_name={item.team_name}
            vote_count={item.vote_count}
          />
        ))}
      </div>
    </div>
  );
};

export default CaseBox;