// src/components/AIChatWidget.jsx
import { useState } from 'react'
import ChatBotAssistant from '../pages/ChatBotAssistant.jsx' // exact case, matches usage below

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 rounded-full shadow-lg bg-blue-600 text-white w-12 h-12 flex items-center justify-center hover:bg-blue-700"
        aria-label="Open AI chat"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-[360px] max-w-[95vw] z-50">
          <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-200">Smart Shelf Assistant</h3>
              <button
                className="text-slate-400 hover:text-slate-200 text-sm"
                onClick={() => setOpen(false)}
                aria-label="Close AI chat"
              >
                Close
              </button>
            </div>

            <div className="h-[420px]">
              <ChatBotAssistant />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
