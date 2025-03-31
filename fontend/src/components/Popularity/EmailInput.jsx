import React, { useState } from "react";

const EmailInput = ({
  defaultDomain = "@example.com",
  placeholder = "請輸入 email",
  onChange, // 新增 callback
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e) => {
    const rawInput = e.target.value;
    const [localPart] = rawInput.split("@"); // 拿 @ 前的部分
    setInputValue(localPart);
    if (onChange) {
      onChange(localPart); // 將 user_id 傳給外層
    }
  };

  return (
    <div className="email-input">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <span>{defaultDomain}</span>
    </div>
  );
};

export default EmailInput;
