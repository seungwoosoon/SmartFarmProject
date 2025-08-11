// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePages from "./pages/HomePages";
import MyFarm from "./pages/MyFarm";
import MyPage from "./pages/MyPage";
import MyPlant from "./pages/MyPlant";
import UnityPlayer from "./pages/UnityPlayer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePages />} />
        <Route path="/myfarm" element={<MyFarm />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/myplant" element={<MyPlant />} />
        <Route path="/unity" element={<UnityPlayer />} />
        {/* 추가적인 라우트가 필요하면 여기에 작성 */}
      </Routes>
    </Router>
  );
}

export default App;
