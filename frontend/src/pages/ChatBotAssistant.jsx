// src/pages/ChatBotAssistant.jsx
import { useState, useRef, useEffect } from 'react';
import api from '../utils/api.js';

export default function ChatBotAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I can help you with expiring items, reminders, and more.' }
  ]);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    // scroll to bottom when messages update
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((m) => [...m, { from: 'you', text }]);
    setSending(true);
    try {
      // POST to the server AI route (api encodes baseURL)
      // send messages as array of { role, content } for context
      const payload = { messages: [...messages.filter(Boolean).map(m => ({ role: m.from === 'you' ? 'user' : 'assistant', content: m.text })), { role: 'user', content: text }] };
      const { data } = await api.post('/ai/chat', payload);
      const reply = data?.reply || 'Got it!';
      setMessages((m) => [...m, { from: 'bot', text: reply }]);
    } catch (err) {
      console.error('AI request failed', err);
      setMessages((m) => [...m, { from: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div ref={listRef} className="h-72 overflow-y-auto space-y-2 p-2 bg-white border rounded">
        {messages.map((m, i) => (
          <div key={i} className={m.from === 'you' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}>
            <div className={m.from === 'you' ? 'rounded-lg bg-blue-600 text-white px-3 py-2' : 'rounded-lg bg-gray-100 px-3 py-2'}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2"
          placeholder="Ask me anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Ask assistant"
        />
        <button
          disabled={sending}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
