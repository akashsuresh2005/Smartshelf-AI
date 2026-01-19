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

//   // Auto scroll
//   useEffect(() => {
//     if (!listRef.current) return;
//     listRef.current.scrollTop = listRef.current.scrollHeight;
//   }, [messages]);

//   // small helper: safe JWT payload parser (no external deps)
//   function parseJwtSafe(token) {
//     if (!token || typeof token !== "string") return null;
//     try {
//       const parts = token.split(".");
//       if (parts.length < 2) return null;
//       const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
//       const decoded = atob(payload);
//       // decodeURIComponent trick to handle utf8
//       const json = decodeURIComponent(
//         decoded
//           .split("")
//           .map((c) => {
//             return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//           })
//           .join("")
//       );
//       return JSON.parse(json);
//     } catch (e) {
//       return null;
//     }
//   }

//   // NEW SEND FUNCTION (robust userId extraction + graceful fallback)
//   const send = async (e) => {
//     e?.preventDefault();
//     const text = input.trim();
//     if (!text) return;

//     // Add user's message
//     const userMsg = { from: "you", text };
//     setMessages((m) => [...m, userMsg]);
//     setInput("");
//     setSending(true);

//     try {
//       // 1) prefer explicit stored uid (set on login)
//       let userId = null;
//       try {
//         userId = localStorage.getItem("uid") || null;
//       } catch (e) {
//         userId = null;
//       }

//       // 2) fallback: decode token stored in localStorage (if any)
//       if (!userId) {
//         try {
//           const token = localStorage.getItem("token");
//           if (token) {
//             const payload = parseJwtSafe(token);
//             // common fields where id may live
//             userId = payload?.id || payload?.userId || payload?.sub || payload?._id || null;
//           }
//         } catch (e) {
//           userId = null;
//         }
//       }

//       // Debug: show what userId we will send (non-invasive)
//       console.debug("[ChatBotAssistant] sending chat, userId:", userId);

//       // If still no userId: prompt sign-in (do not send broken request)
//       if (!userId) {
//         setMessages((m) => [
//           ...m,
//           { from: "bot", text: "Please sign in to use SmartShelf AI." }
//         ]);
//         setSending(false);
//         return;
//       }

//       // Call backend chat endpoint - api attaches Authorization header already (if token exists)
//       const reply = await api.post("/chat", { userId, message: text });

//       // Debug: log raw reply for inspection
//       console.debug("[ChatBotAssistant] /chat reply:", reply);

//       // reply might be plain text (api.js returns text for text/plain) or JSON object
//       if (typeof reply === "string") {
//         setMessages((m) => [...m, { from: "bot", text: reply }]);
//       } else if (reply && reply.summary) {
//         const parts = [reply.summary];
//         if (reply.details) parts.push(reply.details);
//         if (reply.items && reply.items.length) {
//           parts.push(
//             `Found ${reply.items.length} item(s): ` +
//               reply.items
//                 .map((it) => `${it.name} (${it.expiryDate ? new Date(it.expiryDate).toLocaleDateString() : "—"})`)
//                 .join(", ")
//           );
//         }
//         setMessages((m) => [...m, { from: "bot", text: parts.join("\n\n") }]);
//       } else {
//         setMessages((m) => [...m, { from: "bot", text: reply?.message || "Got it!" }]);
//       }
//     } catch (err) {
//       console.error("AI request failed:", err);
//       const userFacing =
//         err?.response?.status === 401
//           ? "Please sign in to use SmartShelf AI."
//           : "Something went wrong — try again.";
//       setMessages((m) => [...m, { from: "bot", text: userFacing }]);
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-5 w-full">
//       {/* Title */}
//       <div className="text-center">
//         <h2 className="text-2xl font-bold text-blue-500 animate-fade-in">🤖 SmartShelf AI Assistant</h2>
//         <p className="text-sm text-gray-400 mt-1 animate-fade-in-slow">
//           Ask me anything about your items, recipes, storage, reminders, and more.
//         </p>
//       </div>

//       {/* Chat Box */}
//       <div
//         ref={listRef}
//         className="h-72 overflow-y-auto space-y-3 p-4 bg-white border border-gray-300 rounded-xl shadow-md transition-all duration-300 ease-in-out"
//         aria-live="polite"
//       >
//         {messages.map((m, i) => (
//           <div key={i} className={m.from === "you" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"}>
//             <div
//               className={`px-4 py-3 rounded-xl text-sm animate-slide-up ${
//                 m.from === "you"
//                   ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
//                   : "bg-gray-100 text-gray-800 shadow-sm"
//               }`}
//             >
//               <pre className="whitespace-pre-wrap">{m.text}</pre>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input & Send */}
//       <form onSubmit={send} className="flex gap-3 items-center">
//         <input
//           className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 animate-fade-in-slow"
//           placeholder="Ask me anything..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           aria-label="Ask assistant"
//         />
//         <button
//           disabled={sending}
//           className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 text-sm font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all duration-200 shadow-md animate-fade-in"
//         >
//           {sending ? "Sending…" : "Send"}
//         </button>
//       </form>

//       {/* Animations (no `jsx` attribute) */}
//       <style>{`
//         @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes fade-in-slow { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
//         .animate-fade-in-slow { animation: fade-in-slow 0.8s ease-out forwards; }
//         .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
//       `}</style>
//     </div>
//   );
// }
// src/pages/ChatBotAssistant.jsx
import { useState, useRef, useEffect } from "react";
import api from "../utils/api.js";

export default function ChatBotAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text:
        "Hi! I'm your SmartShelf AI — I can help you with expiries, storage tips, recipes, reminders, and more."
    }
  ]);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  /* ===================== */
  /* AUTO SCROLL */
  /* ===================== */
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  /* ===================== */
  /* SAFE JWT PARSER */
  /* ===================== */
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

  /* ===================== */
  /* SEND MESSAGE */
  /* ===================== */
  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Show user message immediately
    setMessages(m => [...m, { from: "you", text }]);
    setInput("");
    setSending(true);

    try {
      let userId = localStorage.getItem("uid");

      if (!userId) {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = parseJwtSafe(token);
          userId =
            payload?.id ||
            payload?.userId ||
            payload?.sub ||
            payload?._id ||
            null;
        }
      }

      if (!userId) {
        setMessages(m => [
          ...m,
          { from: "bot", text: "Please sign in to use SmartShelf AI." }
        ]);
        setSending(false);
        return;
      }

      console.debug("[ChatBotAssistant] sending chat, userId:", userId);

      // IMPORTANT:
      // api.post() already returns response body because of axios interceptor
      const reply = await api.post("/api/chat", {
        userId,
        message: text
      });

      console.debug("[ChatBotAssistant] /api/chat reply:", reply);

      /* ===================== */
      /* NORMALIZE ALL REPLIES */
      /* ===================== */
      let finalText = "";

      // Case 1: plain text
      if (typeof reply === "string") {
        finalText = reply;
      }

      // Case 2: array (DB results or AI chunks)
      else if (Array.isArray(reply)) {
        finalText = reply
          .map((item, index) => {
            if (typeof item === "string") return item;

            if (item.name && item.expiryDate) {
              return `${index + 1}. ${item.name} — expires on ${new Date(
                item.expiryDate
              ).toLocaleDateString()}`;
            }

            if (item.message) return item.message;
            if (item.summary) return item.summary;

            return `${index + 1}. ${JSON.stringify(item)}`;
          })
          .join("\n");
      }

      // Case 3: object
      else if (typeof reply === "object" && reply !== null) {
        finalText =
          reply.message ||
          reply.summary ||
          JSON.stringify(reply, null, 2);
      }

      // Fallback
      else {
        finalText = "I received your message, but couldn’t format the reply.";
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
              : "Something went wrong — try again."
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  /* ===================== */
  /* UI */
  /* ===================== */
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-500">
          🤖 SmartShelf AI Assistant
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Ask me anything about your items, recipes, storage, reminders, and more.
        </p>
      </div>

      {/* Chat Box */}
      <div
        ref={listRef}
        className="h-72 overflow-y-auto space-y-3 p-4 bg-white border border-gray-300 rounded-xl shadow-md"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.from === "you" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"}
          >
            <div
              className={`px-4 py-3 rounded-xl text-sm ${
                m.from === "you"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <pre className="whitespace-pre-wrap">{m.text}</pre>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-3">
        <input
          className="flex-1 rounded-full border px-4 py-2 text-sm"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={sending}
          className="rounded-full bg-blue-600 text-white px-5 py-2 text-sm disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}


