// src/pages/ChatBotAssistant.jsx
import { useState, useRef, useEffect } from "react";
import api from "../utils/api.js";

export default function ChatBotAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm your SmartShelf AI — I can help you with expiries, storage tips, recipes, reminders, and more."
    }
  ]);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  // NEW SEND FUNCTION (matches new backend)
  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Add user's message
    const userMsg = { from: "you", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      // SAFELY get userId from localStorage
      let userId = null;
      try {
        userId = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('uid') : null;
      } catch (e) {
        userId = null;
      }

      if (!userId) {
        setMessages((m) => [...m, { from: "bot", text: "Please sign in to use SmartShelf AI." }]);
        setSending(false);
        return;
      }

      // --- CALL NEW CHAT ENDPOINT ---
      const reply = await api.post("/chat", {
        userId,
        message: text
      });

      // reply is plain TEXT (because of api.js)
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    } catch (err) {
      console.error("AI request failed:", err);
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Something went wrong — try again." }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ✨ Title Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-500 animate-fade-in">
          🤖 SmartShelf AI Assistant
        </h2>
        <p className="text-sm text-gray-400 mt-1 animate-fade-in-slow">
          Ask me anything about your items, recipes, storage, reminders, and more.
        </p>
      </div>

      {/* 💬 Chat Box */}
      <div
        ref={listRef}
        className="h-72 overflow-y-auto space-y-3 p-4 bg-white border border-gray-300 rounded-xl shadow-md transition-all duration-300 ease-in-out"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.from === "you"
                ? "ml-auto max-w-[80%]"
                : "mr-auto max-w-[80%]"
            }
          >
            <div
              className={`px-4 py-3 rounded-xl text-sm animate-slide-up ${
                m.from === "you"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-800 shadow-sm"
              }`}
            >
              <pre className="whitespace-pre-wrap">{m.text}</pre>
            </div>
          </div>
        ))}
      </div>

      {/* 📝 Input & Send */}
      <form onSubmit={send} className="flex gap-3 items-center">
        <input
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 animate-fade-in-slow"
          placeholder="Ask me anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Ask assistant"
        />
        <button
          disabled={sending}
          className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 text-sm font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all duration-200 shadow-md animate-fade-in"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>

      {/* ✨ Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-slow {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-fade-in-slow {
          animation: fade-in-slow 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
