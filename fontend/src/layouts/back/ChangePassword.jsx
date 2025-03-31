import React, { useState } from "react";
import Title from "../../components/back/Title";
import { TextField, Button, Box } from "@mui/material";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChangePassword = () => {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.old_password || !form.new_password || !form.confirm_password) {
      alert("請填寫所有欄位");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      alert("新密碼與確認密碼不一致");
      return;
    }

    try {
      await axios.post(`${BASE_URL}api/v1/change-password`, {
        old_password: form.old_password,
        new_password: form.new_password
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
      });

      alert("密碼更新成功！");
      setForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      console.error(err);
      alert("密碼更新失敗，請確認舊密碼是否正確");
    }
  };

  return (
    <div className="ChangePassword">
      <div className="title">
        <Title title="更新密碼" />
      </div>
      <hr />

      <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}>
        <TextField
          label="舊密碼"
          type="password"
          value={form.old_password}
          onChange={handleChange("old_password")}
        />
        <TextField
          label="新密碼"
          type="password"
          value={form.new_password}
          onChange={handleChange("new_password")}
        />
        <TextField
          label="確認新密碼"
          type="password"
          value={form.confirm_password}
          onChange={handleChange("confirm_password")}
        />
        <Button variant="contained" onClick={handleSubmit}>更新密碼</Button>
      </Box>
    </div>
  );
};

export default ChangePassword;
