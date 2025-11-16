// src/components/AIChatWidget.jsx
import { useState } from 'react';
import ChatBotAssistant from '../pages/ChatBotAssistant.jsx';

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 rounded-full shadow-soft bg-blue-600 text-white w-12 h-12 hover:bg-blue-700"
        aria-label="Open AI chat"
        title="Assistant"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 w-[360px] max-w-[95vw] z-50">
          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Smart Shelf Assistant</h3>
              <button className="text-gray-500" onClick={() => setOpen(false)}>Close</button>
            </div>
            <ChatBotAssistant />
          </div>
        </div>
      )}
    </>
  );
}
