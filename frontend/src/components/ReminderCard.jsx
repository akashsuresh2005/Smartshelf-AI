// src/components/ReminderCard.jsx
export default function ReminderCard({ reminder }) {
  const dateStr = reminder?.date ? new Date(reminder.date).toLocaleString() : '—'

  // Optional urgency styling based on time difference
  const now = Date.now()
  const due = reminder?.date ? new Date(reminder.date).getTime() : null
  const diff = due ? due - now : null
  const urgencyCls =
    diff == null
      ? 'bg-slate-800/60 text-slate-300 border border-slate-700/50'
      : diff < 0
      ? 'bg-red-900/30 text-red-300 border border-red-800/50'
      : diff <= 24 * 60 * 60 * 1000
      ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/50'
      : 'bg-blue-900/30 text-blue-300 border border-blue-800/50'

  return (
    <div className="bg-slate-900/60 rounded-lg border border-slate-800/50 p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-semibold text-slate-200 truncate">{reminder.title}</p>
        <p className="text-sm text-slate-500 mt-0.5">{dateStr}</p>
      </div>
      <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${urgencyCls}`}>
        Reminder
      </span>
    </div>
  )
}
