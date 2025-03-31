import React from "react";
import { AiFillForward } from "react-icons/ai";

const StepTitle = ({ StepNum, title }) => {
  return (
    <div className="StepTitle">
      <div className="StepTitle__header">
        <p>Setp {StepNum}</p>
        <AiFillForward />
      </div>
      <h3>{title}</h3>
    </div>
  );
};

export default StepTitle;
