import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.text())
      .then((data) => setMessage(data));
  }, []);

  return (
    <div className="App">
      <h1>🧪 Test React + Spring Boot</h1>
      <p>🚀 백엔드 응답: {message}</p>
      <h2>Success Full Request ~~!!!!!</h2>
    </div>
  );
}

export default App;