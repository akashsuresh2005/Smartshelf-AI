// src/components/ReminderCard.jsx
export default function ReminderCard({ reminder }) {
  // reminder may be either:
  // - an item (from /reminders route) with expiryDate and category
  // - or an explicit reminder object with reminderTime/date and title
  const title = reminder?.name || reminder?.title || 'Untitled'
  const category = reminder?.category || reminder?.type || 'other'

  // prefer reminder.reminderTime, else expiryDate, else createdAt
  const rawDate = reminder?.reminderTime || reminder?.expiryDate || reminder?.date || reminder?.createdAt || null
  const d = rawDate ? new Date(rawDate) : null

  // show date only (hide time)
  const dateStr = d ? d.toLocaleDateString() : '—'

  // small badge styles (use same color tone as item badges)
  const badge = {
    grocery: 'bg-emerald-600 text-white',
    medicine: 'bg-blue-600 text-white',
    cosmetic: 'bg-pink-600 text-white',
    beverage: 'bg-amber-600 text-white',
    other: 'bg-slate-600 text-white'
  }[category] || 'bg-slate-600 text-white'

  // urgency style: color the reminder button (right)
  const now = Date.now()
  const due = d ? d.getTime() : null
  const diff = due ? due - now : null
  const buttonCls =
    diff == null ? 'border border-amber-600 text-amber-400' :
    diff < 0 ? 'border border-red-600 text-red-300' :
    diff <= 24 * 60 * 60 * 1000 ? 'border border-amber-600 text-amber-300' :
    'border border-blue-600 text-blue-300'

  return (
    <div className="bg-slate-900/60 rounded-lg border border-slate-800/50 p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className={`text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded flex-shrink-0 ${badge}`}>
            {category?.charAt(0)?.toUpperCase() + category?.slice(1)}
          </div>
          <p className="font-semibold text-slate-200 truncate text-sm sm:text-base">{title}</p>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 sm:mt-2 flex items-center gap-2">
          <span className="inline-block w-1 h-1 rounded-full bg-slate-500 flex-shrink-0" />
          {dateStr}
        </p>
      </div>
      <div className="flex-shrink-0">
        <button className={`rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm ${buttonCls} bg-transparent whitespace-nowrap`} aria-label="Reminder button">
          Reminder
        </button>
      </div>
    </div>
  )
}