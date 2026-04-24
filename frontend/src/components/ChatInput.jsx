// // src/components/ChatInput.jsx
// import React, { useState } from 'react';
// import api from '../utils/api.js'; // use axios instance exported by utils/api.js

// export default function ChatInput({ onSend }) {
//   const [message, setMessage] = useState('');
//   const [sending, setSending] = useState(false);

//   async function send() {
//     const m = message.trim();
//     if (!m) return;

//     // Optimistic local add
//     onSend('user', m);
//     setMessage('');
//     setSending(true);

//     try {
//       const userId = (() => {
//         try {
//           return typeof window !== 'undefined' ? localStorage.getItem('uid') : null;
//         } catch {
//           return null;
//         }
//       })();

//       // using api (axios) instance — it returns res.data because of your interceptor
//       const reply = await api.post('/chat', { userId, message: m });

//       // reply could be string or object — normalize to text
//       let text;
//       if (typeof reply === 'string') text = reply;
//       else if (reply && reply.reply) text = reply.reply;
//       else if (reply && reply.message) text = reply.message;
//       else text = JSON.stringify(reply);

//       onSend('ai', text);
//     } catch (err) {
//       console.error('Chat send failed', err);
//       const userFacing = err?.response?.status === 401 ? 'Please sign in to use SmartShelf AI.' : 'Something went wrong — try again.';
//       onSend('ai', userFacing);
//     } finally {
//       setSending(false);
//     }
//   }

//   return (
//     <div className="chatInput">
//       <input
//         placeholder="Ask SmartShelf AI…"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
//         aria-label="Ask SmartShelf AI"
//       />
//       <button onClick={send} disabled={sending}>
//         {sending ? 'Sending…' : 'Send'}
//       </button>
//     </div>
//   );
// }
// src/components/ChatInput.jsx
import React, { useState } from 'react';
import api from '../utils/api.js'; // use axios instance exported by utils/api.js

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function send() {
    const m = message.trim();
    if (!m) return;

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

      if (!userId) {
        onSend('ai', 'Please sign in to use SmartShelf AI.');
        setSending(false);
        return;
      }

      const reply = await api.post('/chat', { userId, message: m });

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
    <div className="chatInput flex items-center gap-2 p-2 bg-slate-900 border-t border-slate-800">
      <input
        placeholder="Ask SmartShelf AI…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
        aria-label="Ask SmartShelf AI"
        className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm sm:text-base text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition"
      />
      <button
        onClick={send}
        disabled={sending}
        className="btn-primary whitespace-nowrap px-4 py-2 text-sm sm:text-base"
      >
        {sending ? 'Sending…' : 'Send'}
      </button>
    </div>
  );
}
