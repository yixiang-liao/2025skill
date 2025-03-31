import React, { useEffect, useState } from "react";
import axios from "axios";
import Title from "../../components/back/Title";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import zhTW from "date-fns/locale/zh-TW";
registerLocale("zh-TW", zhTW);

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/zh-tw";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("zh-tw");

import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VoteTimeConfig = () => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [status, setStatus] = useState("");
  const [currentConfig, setCurrentConfig] = useState(null);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/v1/vote/config`);
      const { start_time, end_time } = res.data;

      // 轉為台北時間
      const start = dayjs.utc(start_time).tz("Asia/Taipei");
      const end = dayjs.utc(end_time).tz("Asia/Taipei");

      setCurrentConfig({ start, end });
    } catch (err) {
      console.error("無法取得目前設定時間", err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSubmit = async () => {
    if (!start || !end) {
      setStatus("請選擇起始與截止時間");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}api/v1/vote/config`,
        {
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setStatus("設定成功！");
      fetchConfig();
    } catch (err) {
      console.error(err);
      setStatus("設定失敗");
    }
  };

  return (
    <div className="vote-time-config">
      <div className="title">
        <Title title="最佳人氣獎時間設定" />
      </div>
      <hr />

      {currentConfig && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Typography variant="body1">
            目前起始時間（台北）：{currentConfig.start.format("YYYY/MM/DD HH:mm")}
          </Typography>
          <Typography variant="body1">
            目前截止時間（台北）：{currentConfig.end.format("YYYY/MM/DD HH:mm")}
          </Typography>
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: 4 }}>起始時間（台北）</label>
        <DatePicker
          selected={start ? start.toDate() : null}
          onChange={(date) => setStart(dayjs(date).tz("Asia/Taipei"))}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy/MM/dd HH:mm"
          locale="zh-TW"
          placeholderText="請選擇起始時間"
          className="form-control"
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: 4 }}>截止時間（台北）</label>
        <DatePicker
          selected={end ? end.toDate() : null}
          onChange={(date) => setEnd(dayjs(date).tz("Asia/Taipei"))}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy/MM/dd HH:mm"
          locale="zh-TW"
          placeholderText="請選擇截止時間"
          className="form-control"
        />
      </div>

      <Button variant="contained" onClick={handleSubmit}>
        送出設定
      </Button>

      {status && (
        <Stack sx={{ width: "100%", marginTop: 2 }}>
          <Alert severity={status.includes("成功") ? "success" : "error"}>
            {status}
          </Alert>
        </Stack>
      )}
    </div>
  );
};

export default VoteTimeConfig;
