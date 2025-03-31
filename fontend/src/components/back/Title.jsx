import React from "react";
import { FaBookmark } from "react-icons/fa6";

const Title = ({ title }) => {
  return (
    <div className="Title">
      <h2>
        {title}
        <em>
          <FaBookmark />
        </em>
      </h2>
    </div>
  );
};

export default Title;
