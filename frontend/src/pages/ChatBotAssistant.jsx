import { useState, useRef, useEffect } from "react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChatBotAssistant() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hi! I'm your SmartShelf AI assistant.\n\nAsk me about:\n• Items expiring soon\n• Recipe ideas for your shelf\n• Optimal food & medicine storage\n• Shelf inventory status"
    }
  ]);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  function parseJwtSafe(token) {
    if (!token || typeof token !== "string") return null;
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(
        decodeURIComponent(
          decoded
            .split("")
            .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        )
      );
    } catch {
      return null;
    }
  }

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    // Show user message immediately
    setMessages(m => [...m, { from: "you", text }]);
    setInput("");
    setSending(true);

    try {
      let userId = user?.id || user?._id || localStorage.getItem("uid");

      if (!userId) {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = parseJwtSafe(token);
          userId = payload?.id || payload?.userId || payload?.sub || payload?._id || null;
        }
      }

      if (!userId) {
        setMessages(m => [
          ...m,
          { from: "bot", text: "Please sign in to access your personal SmartShelf assistant." }
        ]);
        setSending(false);
        return;
      }

      const reply = await api.post("/chat", {
        userId,
        message: text
      });

      let finalText = "";

      if (typeof reply === "string") {
        finalText = reply;
      } else if (Array.isArray(reply)) {
        finalText = reply
          .map((item, index) => {
            if (typeof item === "string") return item;
            if (item.name && item.expiryDate) {
              return `${index + 1}. ${item.name} — expires on ${new Date(item.expiryDate).toLocaleDateString()}`;
            }
            if (item.message) return item.message;
            if (item.summary) return item.summary;
            return typeof item === "object" ? `${index + 1}. ${item.name || "Item"}` : String(item);
          })
          .join("\n");
      } else if (typeof reply === "object" && reply !== null) {
        finalText =
          reply.text ||
          reply.reply ||
          reply.message ||
          reply.summary ||
          "Understood.";
      } else {
        finalText = String(reply || "I am ready to help.");
      }

      setMessages(m => [...m, { from: "bot", text: finalText }]);
    } catch (err) {
      console.error("AI request failed:", err);
      setMessages(m => [
        ...m,
        {
          from: "bot",
          text:
            err?.response?.status === 401
              ? "Please sign in to use SmartShelf AI."
              : "Unable to connect to SmartShelf AI assistant. Please try again."
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center py-2">
        <h2 className="text-3xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          🤖 SmartShelf AI Assistant
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Ask about shelf expiries, recipes, storage tips, or inventory items
        </p>
      </div>

      {/* Chat Messages */}
      <div
        ref={listRef}
        className="h-96 overflow-y-auto space-y-3.5 p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-sm"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.from === "you" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[85%]"}
          >
            <div
              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all shadow-md ${
                m.from === "you"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm"
                  : "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-sm"
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm">{m.text}</pre>
            </div>
          </div>
        ))}

        {sending && (
          <div className="mr-auto max-w-[80%]">
            <div className="px-4 py-2.5 rounded-2xl text-sm bg-slate-800/80 text-cyan-300 border border-slate-700/50 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>SmartShelf AI is thinking…</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setInput("What is expiring soon?")}
          className="bg-slate-800/70 hover:bg-slate-700/70 text-cyan-300 border border-slate-700/50 rounded-full px-3 py-1 transition-colors"
        >
          ⏰ What is expiring soon?
        </button>
        <button
          type="button"
          onClick={() => setInput("Suggest a recipe with my shelf ingredients")}
          className="bg-slate-800/70 hover:bg-slate-700/70 text-indigo-300 border border-slate-700/50 rounded-full px-3 py-1 transition-colors"
        >
          🍲 Recipe suggestions
        </button>
        <button
          type="button"
          onClick={() => setInput("How should I store dairy products to last longer?")}
          className="bg-slate-800/70 hover:bg-slate-700/70 text-emerald-300 border border-slate-700/50 rounded-full px-3 py-1 transition-colors"
        >
          💡 Food storage tips
        </button>
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-2.5 items-center">
        <input
          className="flex-1 rounded-xl bg-slate-800/70 border border-slate-700/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
          placeholder="Ask anything (e.g., 'where is my milk stored?' or 'quick dinner idea')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium px-6 py-3 text-sm disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
        >
          <span>Send</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  );
}
