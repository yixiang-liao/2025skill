import React from "react";
import { FaBookmark } from "react-icons/fa6";

const Title = ({ title, eng_title }) => {
  return (
    <div className="Title">
      <h2>
        {title}
        <em>
          <FaBookmark />
          {eng_title}
        </em>
      </h2>
    </div>
  );
};

export default Title;
