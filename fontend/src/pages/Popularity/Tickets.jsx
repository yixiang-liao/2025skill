import React, { useState, useEffect } from "react";
import BasicExample from "../../layouts/Popularity/NavBar";
import Footer from "../../layouts/Popularity/Footer";
import Title from "../../components/Popularity/Title";
import EmailInput from "../../components/Popularity/EmailInput";
import StepTitle from "../../components/Popularity/StepTitle";
import VerificationCodeInput from "../../components/Popularity/VerificationCodeInput";
import SearchableSelect from "../../components/Popularity/SearchableSelect";
import TextField from "@mui/material/TextField";
import { IoTicketSharp } from "react-icons/io5";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Tickets = () => {
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setmessage] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [userName, setUserName] = useState("");
  const [userDeparment, setUserDeparment] = useState("");
  const [vote1, setVote1] = useState(null);
  const [vote2, setVote2] = useState(null);
  const [voteStart, setVoteStart] = useState(null);
  const [voteEnd, setVoteEnd] = useState(null);
  const [now, setNow] = useState(dayjs().tz("Asia/Taipei"));

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs().tz("Asia/Taipei")), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    if (!userId) {
      alert("請輸入 Email 帳號");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}api/v1/status/${userId}`
      );
      if (!response.ok) {
        throw new Error("查詢失敗");
      }
      const data = await response.json();
      setStatus(data.status);
      setmessage(data.message);

      // 從後端取來的 vote_start / vote_end 是 UTC，要轉為台北時間
      const voteTimeRes = await fetch(`${BASE_URL}api/v1/vote/config`);
      if (voteTimeRes.ok) {
        const timeData = await voteTimeRes.json();
        setVoteStart(dayjs.utc(timeData.start_time).tz("Asia/Taipei"));
        setVoteEnd(dayjs.utc(timeData.end_time).tz("Asia/Taipei"));
      }
    } catch (err) {
      console.error(err);
      alert("查詢時發生錯誤");
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      alert("請輸入 6 位數驗證碼");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}api/v1/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          code: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("驗證成功！");
        setStatus("verified");
      } else {
        alert(data.detail || "驗證失敗");
      }
    } catch (err) {
      console.error(err);
      alert("驗證發生錯誤");
    }
  };

  const handleVote = async () => {
    if (!userName || !userDeparment || !vote1 || !vote2) {
      alert("請填寫姓名、單位，並選擇兩個隊伍！");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}api/v1/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          username: userName,
          department: userDeparment,
          vote1: vote1.value,
          vote2: vote2.value,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("投票成功！");
        setStatus("voted");
      } else {
        alert(data.detail || "投票失敗");
      }
    } catch (err) {
      console.error(err);
      alert("提交投票時發生錯誤");
    }
  };

  const isBeforeVote = voteStart && now.isBefore(voteStart);
  const isAfterVote = voteEnd && now.isAfter(voteEnd);

  return (
    <div className="Tickets">
      <BasicExample />
      <div className="header">
        <Title title="我要投票" eng_title="Vote" />
      </div>
      <div className="content">
        {/* Step 1: Email 驗證身份 */}
        <div className="step1-email">
          <div className="step_title">
            <StepTitle StepNum="01" title="輸入Email驗證身份" />
            <hr />
          </div>
          <EmailInput
            placeholder="請輸入NKUST Email"
            defaultDomain="@nkust.edu.tw"
            onChange={(value) => setUserId(value)}
          />
          <button className="btn" onClick={handleSubmit}>
            送出
          </button>

          {message && (
            <div className="status-box">
              <strong>{message}</strong>
            </div>
          )}
        </div>

        {/* Step 2: 驗證碼 */}
        {status === "registered" && (
          <div className="step2-code">
            <div className="step_title">
              <StepTitle StepNum="02" title="輸入驗證碼" />
              <hr />
            </div>
            <div className="code-box">
              <VerificationCodeInput onComplete={(code) => setOtpCode(code)} />
              <button className="btn" onClick={handleVerify}>
                送出
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 開始投票 */}
        {status === "verified" && (
          <div className="step3-vote">
            <StepTitle StepNum="03" title="開始投票" />
            <hr />
            {isBeforeVote && (
              <p>投票尚未開始，預計開始時間：{voteStart.format("YYYY-MM-DD HH:mm")}</p>
            )}
            {isAfterVote && (
              <p>投票已結束，截止時間為：{voteEnd.format("YYYY-MM-DD HH:mm")}</p>
            )}
            {!isBeforeVote && !isAfterVote && (
              <div className="vote-box">
                <TextField
                  label="請輸入姓名"
                  value={userName}
                  variant="outlined"
                  onChange={(e) => setUserName(e.target.value)}
                />
                <TextField
                  className="deparment"
                  label="請輸入科系或單位全銜"
                  value={userDeparment}
                  variant="outlined"
                  onChange={(e) => setUserDeparment(e.target.value)}
                />
                <div className="vote1">
                  <label>
                    <IoTicketSharp /> 第一票
                  </label>
                  <SearchableSelect onSelect={(v) => setVote1(v)} />
                </div>
                <div className="vote2">
                  <label>
                    <IoTicketSharp /> 第二票
                  </label>
                  <SearchableSelect onSelect={(v) => setVote2(v)} />
                </div>
                <button className="btn" onClick={handleVote}>
                  送出投票
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Tickets;
