
// // src/pages/ChatBotAssistant.jsx
// import { useState, useRef, useEffect } from "react";
// import api from "../utils/api.js";

// export default function ChatBotAssistant() {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([
//     {
//       from: "bot",
//       text:
//         "Hi! I'm your SmartShelf AI — I can help you with expiries, storage tips, recipes, reminders, and more."
//     }
//   ]);
//   const [sending, setSending] = useState(false);
//   const listRef = useRef(null);

//   /* ===================== */
//   /* AUTO SCROLL */
//   /* ===================== */
//   useEffect(() => {
//     if (!listRef.current) return;
//     listRef.current.scrollTop = listRef.current.scrollHeight;
//   }, [messages]);

//   /* ===================== */
//   /* SAFE JWT PARSER */
//   /* ===================== */
//   function parseJwtSafe(token) {
//     if (!token || typeof token !== "string") return null;
//     try {
//       const payload = token.split(".")[1];
//       const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
//       return JSON.parse(
//         decodeURIComponent(
//           decoded
//             .split("")
//             .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//             .join("")
//         )
//       );
//     } catch {
//       return null;
//     }
//   }

//   /* ===================== */
//   /* SEND MESSAGE */
//   /* ===================== */
//   const send = async (e) => {
//     e?.preventDefault();
//     const text = input.trim();
//     if (!text) return;

//     // Show user message immediately
//     setMessages(m => [...m, { from: "you", text }]);
//     setInput("");
//     setSending(true);

//     try {
//       let userId = localStorage.getItem("uid");

//       if (!userId) {
//         const token = localStorage.getItem("token");
//         if (token) {
//           const payload = parseJwtSafe(token);
//           userId =
//             payload?.id ||
//             payload?.userId ||
//             payload?.sub ||
//             payload?._id ||
//             null;
//         }
//       }

//       if (!userId) {
//         setMessages(m => [
//           ...m,
//           { from: "bot", text: "Please sign in to use SmartShelf AI." }
//         ]);
//         setSending(false);
//         return;
//       }

//       console.debug("[ChatBotAssistant] sending chat, userId:", userId);

//       // IMPORTANT:
//       // api.post() already returns response body because of axios interceptor
//       const reply = await api.post("/api/chat", {
//         userId,
//         message: text
//       });

//       console.debug("[ChatBotAssistant] /api/chat reply:", reply);

//       /* ===================== */
//       /* NORMALIZE ALL REPLIES */
//       /* ===================== */
//       let finalText = "";

//       // Case 1: plain text
//       if (typeof reply === "string") {
//         finalText = reply;
//       }

//       // Case 2: array (DB results or AI chunks)
//       else if (Array.isArray(reply)) {
//         finalText = reply
//           .map((item, index) => {
//             if (typeof item === "string") return item;

//             if (item.name && item.expiryDate) {
//               return `${index + 1}. ${item.name} — expires on ${new Date(
//                 item.expiryDate
//               ).toLocaleDateString()}`;
//             }

//             if (item.message) return item.message;
//             if (item.summary) return item.summary;

//             return `${index + 1}. ${JSON.stringify(item)}`;
//           })
//           .join("\n");
//       }

//       // Case 3: object
//       else if (typeof reply === "object" && reply !== null) {
//         finalText =
//           reply.message ||
//           reply.summary ||
//           JSON.stringify(reply, null, 2);
//       }

//       // Fallback
//       else {
//         finalText = "I received your message, but couldn’t format the reply.";
//       }

//       setMessages(m => [...m, { from: "bot", text: finalText }]);
//     } catch (err) {
//       console.error("AI request failed:", err);
//       setMessages(m => [
//         ...m,
//         {
//           from: "bot",
//           text:
//             err?.response?.status === 401
//               ? "Please sign in to use SmartShelf AI."
//               : "Something went wrong — try again."
//         }
//       ]);
//     } finally {
//       setSending(false);
//     }
//   };

//   /* ===================== */
//   /* UI */
//   /* ===================== */
//   return (
//     <div className="flex flex-col gap-5 w-full">
//       {/* Title */}
//       <div className="text-center">
//         <h2 className="text-2xl font-bold text-blue-500">
//           🤖 SmartShelf AI Assistant
//         </h2>
//         <p className="text-sm text-gray-400 mt-1">
//           Ask me anything about your items, recipes, storage, reminders, and more.
//         </p>
//       </div>

//       {/* Chat Box */}
//       <div
//         ref={listRef}
//         className="h-72 overflow-y-auto space-y-3 p-4 bg-white border border-gray-300 rounded-xl shadow-md"
//       >
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             className={m.from === "you" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"}
//           >
//             <div
//               className={`px-4 py-3 rounded-xl text-sm ${
//                 m.from === "you"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-100 text-gray-800"
//               }`}
//             >
//               <pre className="whitespace-pre-wrap">{m.text}</pre>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <form onSubmit={send} className="flex gap-3">
//         <input
//           className="flex-1 rounded-full border px-4 py-2 text-sm"
//           placeholder="Ask me anything..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />
//         <button
//           disabled={sending}
//           className="rounded-full bg-blue-600 text-white px-5 py-2 text-sm disabled:opacity-60"
//         >
//           {sending ? "Sending…" : "Send"}
//         </button>
//       </form>
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react"
import api from "../utils/api.js"

export default function ChatBotAssistant() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about your items, expiry, or recommendations." }
  ])
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth"
    })
  }, [messages])

  const suggestions = [
    "Show expiring items",
    "What should I consume today?",
    "Add milk",
    "Give storage tips"
  ]

  const send = async (e) => {
    e?.preventDefault()
    if (!input.trim()) return

    const text = input
    setMessages(m => [...m, { from: "you", text }])
    setInput("")
    setSending(true)

    try {
      const userId = localStorage.getItem("uid")

      const reply = await api.post("/api/chat", {
        message: text,
        userId
      })

      const finalText =
        typeof reply === "string"
          ? reply
          : reply?.message || JSON.stringify(reply)

      setMessages(m => [...m, { from: "bot", text: finalText }])
    } catch {
      setMessages(m => [...m, { from: "bot", text: "Something went wrong." }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[400px] sm:min-h-[500px] bg-slate-900 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-800 flex-shrink-0">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-cyan-400">
          🤖 SmartShelf Assistant
        </h2>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2 sm:p-3 border-b border-slate-800/50 flex-shrink-0">
        {suggestions.map(q => (
          <button
            key={q}
            onClick={() => setInput(q)}
            className="text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[78%] md:max-w-[70%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm md:text-base leading-relaxed ${
                m.from === "you"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-slate-800 text-slate-200 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 px-3 sm:px-4 py-2 rounded-2xl rounded-bl-sm text-xs sm:text-sm">
              Typing…
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={send}
        className="flex gap-2 p-2 sm:p-3 border-t border-slate-800 flex-shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-500 min-w-0"
          placeholder="Ask something..."
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="flex-shrink-0 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  )
}