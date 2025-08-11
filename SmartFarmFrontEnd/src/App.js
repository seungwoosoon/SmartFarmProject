// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePages from "./pages/HomePages";
import MyFarm from "./pages/MyFarm";
import MyPage from "./pages/MyPage";
import MyPlant from "./pages/MyPlant";

function App() {
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
