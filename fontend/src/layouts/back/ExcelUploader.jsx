import React, { useState } from "react";
import axios from "axios";
import { FaFileExcel } from "react-icons/fa";
import Title from "../../components/back/Title";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ExcelUploader = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setUploadStatus(""); // 清空上次狀態
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("請選擇檔案！");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${BASE_URL}api/v1/upload-excel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setUploadStatus(`✅ ${response.data.message}`);
    } catch (error) {
      console.error(error);
      setUploadStatus("❌ 上傳失敗，請檢查檔案格式或登入權限");
    }
  };


  return (
    <div className="excel-input">
      <div className="title">
        <Title title="團隊資料上傳" />
      </div>

      <hr />
      <a
        href="/example_excel.xlsx"
        download="範例excel.xlsx"
        className="btn-download"
      >
        下載範例 Excel
      </a>
      <label className="input">
        <FaFileExcel className="excel-icon" />
        <span className="excel-text">
          {fileName ? fileName : "上傳 Excel 檔案"}
        </span>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>
      <button onClick={handleUpload}>上傳 Excel</button>
      {uploadStatus && (
        <div
          className="uploadStatus"
          style={{
            marginTop: "10px",
            color: uploadStatus.startsWith("✅") ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;
