import React from "react";
import OIE_LOGO from "../../assets/OIE_LOGO_工作區域 1.png";
import higheredu from "../../assets/高教深耕_工作區域 1.png";
import NKUST from "../../assets/533313901.png";
import { PiPhoneCallFill } from "react-icons/pi";
import { MdEmail } from "react-icons/md";
import { MdPlace } from "react-icons/md";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="Popularity-footer">
      <div className="container">
        <div className="logo">
          {/* <h3>主辦單位</h3> */}
          <img className="logo-center" src={NKUST} alt="NKUST" />
          <img className="logo-center" src={OIE_LOGO} alt="OIE_LOGO" />
          <img src={higheredu} alt="higheredu" />
        </div>
        <div className="footer-text">
          <p>
            <PiPhoneCallFill />
            (07)601-1000 分機 :38101
          </p>
          <p>
            <MdEmail />
            janine@nkust.edu.tw
          </p>
          <p>
            <MdPlace />
            第一校區 圖書資訊大樓B1 創夢工場
          </p>
          <p>Copyright © {currentYear} I-Hsiang. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
