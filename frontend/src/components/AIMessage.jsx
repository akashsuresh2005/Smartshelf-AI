// src/components/AIMessage.jsx
import React from 'react';

export default function AIMessage({ text, sender }) {
  return (
    <div className={sender === 'ai' ? 'aiBubble' : 'userBubble'}>
      <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{text}</pre>
    </div>
  );
}
