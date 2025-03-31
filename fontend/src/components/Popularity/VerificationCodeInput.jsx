import React, { useRef } from "react";

const VerificationCodeInput = ({ length = 6, onComplete }) => {
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    e.target.value = value;

    if (value && index < length - 1) {
      inputs.current[index + 1].focus();
    }

    triggerOnComplete();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    paste.split("").forEach((char, i) => {
      if (inputs.current[i]) {
        inputs.current[i].value = char;
      }
    });

    // 聚焦到最後一個填入的框
    const lastFilled = Math.min(paste.length, length) - 1;
    if (lastFilled >= 0 && inputs.current[lastFilled]) {
      inputs.current[lastFilled].focus();
    }

    triggerOnComplete();
  };

  const triggerOnComplete = () => {
    const code = inputs.current.map((input) => input.value).join("");
    if (code.length === length) {
      onComplete(code);
    }
  };

  return (
    <div className="code-input-wrapper">
      {[...Array(length)].map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          ref={(el) => (inputs.current[i] = el)}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className="code-input"
        />
      ))}
    </div>
  );
};

export default VerificationCodeInput;
