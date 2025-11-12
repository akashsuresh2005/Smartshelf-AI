import { useState } from 'react'
import api from '../utils/api.js'

export default function ChatBotAssistant() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I can help you with expiring items, reminders, and more.' }
  ])
  const [sending, setSending] = useState(false)

  const send = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages((m) => [...m, { from: 'you', text }])
    setSending(true)
    try {
      // adjust this endpoint to your AI route if needed
      const { data } = await api.post('/ai/ask', { prompt: text })
      const reply = data?.answer || 'Got it!'
      setMessages((m) => [...m, { from: 'bot', text: reply }])
    } catch {
      setMessages((m) => [...m, { from: 'bot', text: 'Sorry, something went wrong.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="h-72 overflow-y-auto space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.from === 'you'
                ? 'ml-auto max-w-[80%] rounded-lg bg-blue-600 text-white px-3 py-2'
                : 'mr-auto max-w-[80%] rounded-lg bg-gray-100 px-3 py-2'
            }
          >
            {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2"
          placeholder="Ask me anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          disabled={sending}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
