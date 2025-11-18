import { useState } from "react";
import apiFetch from "../utils/api";

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState("");

  async function send() {
    if (!message.trim()) return;

    onSend("user", message);

    const res = await apiFetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        userId: localStorage.getItem("uid"),
        message
      })
    });

    onSend("ai", res);
    setMessage("");
  }

  return (
    <div className="chatInput">
      <input
        placeholder="Ask SmartShelf AI…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={send}>Send</button>
    </div>
  );
}
