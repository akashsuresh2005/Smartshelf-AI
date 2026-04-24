import React, { useState, useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import AIMessage from './AIMessage'

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const bottomRef = useRef(null)

  function addMessage(sender, text) {
    setMessages((prev) => [...prev, { sender, text }])
  }

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden">

      {/* 🔥 Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">

        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-8 sm:mt-10 text-xs sm:text-sm px-4">
            Ask anything about your items 🤖
          </div>
        )}

        {messages.map((m, i) => (
          <AIMessage key={i} sender={m.sender} text={m.text} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* 🔥 Input */}
      <div className="border-t border-slate-800 p-1.5 sm:p-2 bg-slate-950">
        <ChatInput onSend={addMessage} />
      </div>
    </div>
  )
}