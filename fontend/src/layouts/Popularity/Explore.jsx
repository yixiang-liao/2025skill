import React, { useState } from "react";
import Title from "../../components/Popularity/Title";
import { GiMechanicalArm } from "react-icons/gi";
import { FaComputer } from "react-icons/fa6";
import { AiFillProduct } from "react-icons/ai";
import { FaShop } from "react-icons/fa6";

const Explore = ({ onThemeChange }) => {
  const handleClick = (code) => {
    onThemeChange(code);
  };

  return (
    <div className="Explore">
      <Title title="探索" eng_title="Explore" />
      <div className="list">
        <ul className="ulli">
          <li>
            <a onClick={() => handleClick("all")}>
              <div className="liicon">
                <AiFillProduct />
              </div>
              <p>全部</p>
            </a>
          </li>
          <li>
            <a onClick={() => handleClick("me")}>
              <div className="liicon">
                <GiMechanicalArm />
              </div>
              <p>機電運輸領域</p>
            </a>
          </li>
          <li>
            <a onClick={() => handleClick("it")}>
              <div className="liicon">
                <FaComputer />
              </div>
              <p>資通訊領域</p>
            </a>
          </li>
          <li>
            <a onClick={() => handleClick("design")}>
              <div className="liicon">
                <FaShop />
              </div>
              <p>服務文創領域</p>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Explore;