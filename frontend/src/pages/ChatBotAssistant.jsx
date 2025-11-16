// src/pages/ChatBotAssistant.jsx - Dark Theme with Larger Fonts
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-semibold text-cyan-400">AI Assistant</h1>
        <button
          onClick={() => setMessages([{ from: 'bot', text: 'Hi! I can help you with expiring items, reminders, and more.' }])}
          className="rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 font-medium px-4 py-2 hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Chat
        </button>
      </div>

      <div className="bg-slate-900/60 rounded-lg border border-slate-800/50 p-5 h-[500px] overflow-y-auto space-y-3 scroll-smooth">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.from === 'you'
                ? 'ml-auto max-w-[80%] rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-3 shadow-lg shadow-cyan-500/20'
                : 'mr-auto max-w-[80%] rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-3'
            }
          >
            <div className="flex items-start gap-2">
              {m.from === 'bot' && (
                <div className="flex-none w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                  AI
                </div>
              )}
              <p className="text-base leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="mr-auto max-w-[80%] rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-none w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={send} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-xl px-4 py-3 pr-12 text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-500"
            placeholder="Ask me anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          disabled={sending || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold px-6 py-3 hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center gap-2"
        >
          {sending ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </>
          )}
        </button>
      </form>
    </div>
  )
}