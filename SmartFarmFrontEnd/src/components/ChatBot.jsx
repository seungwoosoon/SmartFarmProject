// src/components/ChatBot.jsx
import React from 'react';
import './ChatBot.css';

function ChatBot({ open, onClose, answer }) {
  if (!open) return null;
  return (
    <div className="chatbot-modal-overlay" onClick={onClose}>
      <div className="chatbot-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="chatbot-modal-close" onClick={onClose} aria-label="모달 닫기">×</button>
        <div className="chatbot-modal-bee">
          <img src="/bee.png" alt="bee" className="chatbot-bee-img" />
        </div>
        <div className="chatbot-modal-content">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
