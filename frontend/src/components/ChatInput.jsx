// src/components/ChatInput.jsx
import React, { useState } from 'react';
import api from '../utils/api.js'; // use axios instance exported by utils/api.js

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function send() {
    const m = message.trim();
    if (!m) return;

    // Optimistic local add
    onSend('user', m);
    setMessage('');
    setSending(true);

    try {
      const userId = (() => {
        try {
          return typeof window !== 'undefined' ? localStorage.getItem('uid') : null;
        } catch {
          return null;
        }
      })();

      // using api (axios) instance — it returns res.data because of your interceptor
      const reply = await api.post('/chat', { userId, message: m });

      // reply could be string or object — normalize to text
      let text;
      if (typeof reply === 'string') text = reply;
      else if (reply && reply.reply) text = reply.reply;
      else if (reply && reply.message) text = reply.message;
      else text = JSON.stringify(reply);

      onSend('ai', text);
    } catch (err) {
      console.error('Chat send failed', err);
      const userFacing = err?.response?.status === 401 ? 'Please sign in to use SmartShelf AI.' : 'Something went wrong — try again.';
      onSend('ai', userFacing);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chatInput">
      <input
        placeholder="Ask SmartShelf AI…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
        aria-label="Ask SmartShelf AI"
      />
      <button onClick={send} disabled={sending}>
        {sending ? 'Sending…' : 'Send'}
      </button>
    </div>
  );
}
