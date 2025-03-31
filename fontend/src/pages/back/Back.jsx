import React, { useState } from "react";
import MySidebar from "../../layouts/back/SildeBar";
import TeamData from "../../layouts/back/TeamData";
import ExcelUploader from "../../layouts/back/ExcelUploader";
import VoteTimeConfig from "../../layouts/back/VoteTimeConfig";
import UserHistory from "../../layouts/back/UserHistory";
import AdminRankTable from "../../layouts/back/AdminRankTable";
import Members from "../../layouts/back/Members";
import RoleManagement from "../../layouts/back/RoleManagement";
import AllReviewer from "../../layouts/back/AllReviewer";
import ChangePassword from "../../layouts/back/ChangePassword";
import TotalScore from "../../layouts/back/TotalScore";

const Back = () => {
  const [selectedPage, setSelectedPage] = useState("dashboard");

  const renderContent = () => {
    switch (selectedPage) {
      case "TeamData":
        return <TeamData />;
      case "ExcelUploader":
        return <ExcelUploader />;
        case "VoteTimeConfig":
          return <VoteTimeConfig />;
        case "UserHistory":
          return <UserHistory />;
        case "AdminRankTable":
          return <AdminRankTable />;
        case "Members":
          return <Members />;
        case "RoleManagement":
          return <RoleManagement />;
        case "ChangePassword":
          return <ChangePassword />;
        case "AllReviewer":
          return <AllReviewer />;
        case "TotalScore":
          return <TotalScore />;
      default:
        return <div>請選擇一個項目</div>;
    }
  };

  return (
    <div className="back-container">
      {/* 固定在左側的 Sidebar */}
      <div className="sidebar">
        <MySidebar onSelect={setSelectedPage} />
      </div>
      {/* 右側主要內容 */}
      <div className="content">{renderContent()}</div>
    </div>
  );
};

export default Back;
