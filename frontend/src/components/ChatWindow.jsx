// src/components/ChatWindow.jsx
import React, { useState } from 'react';
import ChatInput from './ChatInput';
import AIMessage from './AIMessage';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);

  function addMessage(sender, text) {
    setMessages((prev) => [...prev, { sender, text }]);
  }

  return (
    <div className="chatWindow">
      <div className="messages">
        {messages.map((m, i) => (
          <AIMessage key={i} sender={m.sender} text={m.text} />
        ))}
      </div>
      <ChatInput onSend={addMessage} />
    </div>
  );
}
