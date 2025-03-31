import React, { useState } from "react";
import MySidebar from "../../layouts/Score/SildeBar";
import Mark from "../../layouts/Score/Mark";
import ThisMark from "../../layouts/Score/ThisMark";

const ScoreBack = () => {
  const [selectedPage, setSelectedPage] = useState("dashboard");

  const renderContent = () => {
    switch (selectedPage) {
      case "Mark":
        return <Mark />;
      case "ThisMark":
        return <ThisMark />;
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

export default ScoreBack;
