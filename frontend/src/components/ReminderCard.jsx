export default function ReminderCard({ reminder }) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <p className="font-medium">{reminder.title}</p>
        <p className="text-sm text-gray-500">{new Date(reminder.date).toLocaleString()}</p>
      </div>
      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Reminder</span>
    </div>
  )
}
