// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePages from './pages/HomePages';
import MyFarm from './pages/MyFarm';
import MyPage from './pages/MyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePages />} />
        <Route path="/myfarm" element={<MyFarm />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
