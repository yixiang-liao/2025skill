import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BasicExample from "../../layouts/Popularity/NavBar";
import Footer from "../../layouts/Popularity/Footer";
import CountUp from "../../components/Popularity/CountUp";
import { IoTicketSharp } from "react-icons/io5";
import { FaLine, FaLink } from "react-icons/fa6";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CasePage = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const shareCurrentPageWithText = () => {
    const url = encodeURIComponent(window.location.href);
    const message = encodeURIComponent("快來看看這個專案吧！") + "%0A" + url;
    const lineUrl = `https://line.me/R/msg/text/?${message}`;
    window.open(lineUrl, "_blank");
  };

  const copyCurrentLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000); // 自動隱藏
    } catch (err) {
      alert("複製失敗，請手動複製網址");
    }
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}api/v1/open/team/${id}`)
      .then((res) => setTeam(res.data))
      .catch((err) => console.error("取得隊伍資料失敗", err));
  }, [id]);

  if (!team) return <div>載入中...</div>;

  return (
    <div className="CasePage">
      <BasicExample />
      <div className="header">
        <div className="Poster">
          <img src={`${BASE_URL}${team.poster_img}`} alt="Poster" />
        </div>
        <div className="case-content">
          <h1>{team.project_title}</h1>
          <h2>{team.team_name}</h2>
          <div className="field">{team.theme_category}</div>
          <div className="list-group">
            <h3 className="list-title">團隊成員：</h3>
            <ul>
              {team.members.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
          <div className="list-group">
            <h3 className="list-title">指導老師：</h3>
            <ul>
              {team.instructors.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="share-line">
            <h3 className="list-title">分享</h3>
            <div className="share">
              <button className="line" onClick={shareCurrentPageWithText}>
                <FaLine />
              </button>
              <button className="link" onClick={copyCurrentLink}>
                <FaLink />
              </button>
            </div>

            <Collapse in={showAlert}>
              <Alert severity="success" sx={{ m: 2 }}>
                已成功複製連結！
              </Alert>
            </Collapse>
          </div>

          <hr />
          <div className="ticket-area">
            <div className="ticket-icon">
              <IoTicketSharp />
            </div>
            <div className="ticket">
              <CountUp start={0} end={team.vote_count} duration={1200} />
            </div>
          </div>
        </div>
      </div>
      <div className="content">
        <hr />
        <h3 className="list-title">快速導覽</h3>
        <div className="quick-nav">
          <div>
            <a href="#introduce">作品介紹</a>
          </div>
          <div>
            <a href="#poster">作品海報</a>
          </div>
          <div>
            <a href="#img">作品圖片</a>
          </div>
        </div>
        <h3 className="list-title" id="introduce">
          作品介紹
        </h3>
        <p>{team.project_abstract}</p>
        <hr />
        <h3 className="list-title" id="poster">
          作品海報
        </h3>
        <div className="Poster">
          <img src={`${BASE_URL}${team.poster_img}`} alt="Poster" />
        </div>
        <hr />
        <h3 className="list-title" id="img">
          作品圖片
        </h3>
        <div className="img">
          <img src={`${BASE_URL}${team.product_img}`} alt="Product" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CasePage;
