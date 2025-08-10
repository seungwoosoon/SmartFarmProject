// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePages from "./pages/HomePages";
import MyFarm from "./pages/MyFarm";
import MyPage from "./pages/MyPage";
import MyPlant from "./pages/MyPlant";
import { useEffect } from "react";
import i18n from "i18next";

function App() {
  useEffect(() => {
    // 초기 언어를 한국어로 설정
    i18n.changeLanguage("ko");
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePages />} />
        <Route path="/myfarm" element={<MyFarm />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/myplant" element={<MyPlant />} />
      </Routes>
    </Router>
  );
}

export default App;
