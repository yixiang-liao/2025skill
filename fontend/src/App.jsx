import React , { useState } from "react";
import "./styles/style.css";
import AppRoutes from "./routes/index";
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <div className="app">
      {/* <h1>歡迎來到我的 React 應用</h1> */}
      <AppRoutes />
    </div>
  );
}

export default App;
