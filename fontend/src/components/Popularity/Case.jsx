import React from "react";
import { IoTicketSharp } from "react-icons/io5";
import CountUp from "../../components/Popularity/CountUp";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Case = ({ poster_img,theme_category, project_title, team_name, team_id , vote_count }) => {
  return (
    <div className="Case2">
      <a href={`/Popularity/CasePage/${team_id}`}>
        <div className="Poster">
          <img
            src={`${BASE_URL}${poster_img}`}
            alt={project_title}
          />
        </div>
        <div className="case-content">
          <div className="field">{theme_category}</div>
          <h3>{project_title}</h3>
          <h4>{team_name}</h4>
          <hr />
          <div className="ticket-area">
            <div className="ticket-icon">
              <IoTicketSharp />
            </div>
            <div className="ticket">
              <CountUp start={0} end={vote_count} duration={1000} />
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default Case;
