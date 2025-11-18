export default function AIMessage({ text, sender }) {
  return (
    <div className={sender === "ai" ? "aiBubble" : "userBubble"}>
      <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>
    </div>
  );
}
