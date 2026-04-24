// // src/components/NotificationItem.jsx
// export default function NotificationItem({ n, onReadToggle, onDelete }) {
//   const typeBadgeCls =
//     n.type === 'email'
//       ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50'
//       : n.type === 'push'
//       ? 'bg-green-900/30 text-green-300 border border-green-800/50'
//       : 'bg-slate-800/60 text-slate-300 border border-slate-700/50'

//   return (
//     <div className="bg-slate-900/60 rounded-lg border border-slate-800/50 p-4 flex items-start justify-between gap-4">
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2">
//           <span className={`font-semibold ${!n.read ? 'text-cyan-400' : 'text-slate-200'}`}>
//             {n.title}
//           </span>
//           <span className={`text-xs px-2 py-0.5 rounded ${typeBadgeCls}`}>
//             {n.type}
//           </span>
//           {!n.read && (
//             <span className="text-xs px-2 py-0.5 rounded bg-red-900/30 text-red-300 border border-red-800/50">
//               unread
//             </span>
//           )}
//         </div>

//         {n.message && (
//           <p className="text-sm text-slate-400 mt-1 break-words">
//             {n.message}
//           </p>
//         )}

//         <p className="text-xs text-slate-500 mt-1">
//           {new Date(n.createdAt).toLocaleString()}
//         </p>
//       </div>

//       <div className="flex items-center gap-2 shrink-0">
//         <button
//           className="rounded-lg border border-slate-700/50 bg-slate-800/60 text-slate-200 px-3 py-1.5 text-sm hover:bg-slate-700/60 transition-colors"
//           onClick={() => onReadToggle?.(n)}
//           aria-label={n.read ? 'Mark as unread' : 'Mark as read'}
//         >
//           {n.read ? 'Mark unread' : 'Mark read'}
//         </button>
//         <button
//           className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-red-500 transition-colors"
//           onClick={() => onDelete?.(n)}
//           aria-label="Delete notification"
//         >
//           Delete
//         </button>
//       </div>
//     </div>
//   )
// }
// src/components/NotificationItem.jsx - FINAL VERSION

export default function NotificationItem({ n, onReadToggle, onDelete }) {
  const typeBadgeCls =
    n.type === 'email'
      ? 'bg-blue-500/20 text-blue-300'
      : n.type === 'push'
      ? 'bg-green-500/20 text-green-300'
      : 'bg-slate-700 text-slate-300'

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

      {/* LEFT */}
      <div className="flex-1 min-w-0">

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

          <span className={`font-semibold text-sm sm:text-base ${!n.read ? 'text-cyan-400' : 'text-white'}`}>
            {n.title}
          </span>

          <span className={`text-xs px-2 py-0.5 sm:py-1 rounded ${typeBadgeCls}`}>
            {n.type}
          </span>

          {!n.read && (
            <span className="text-xs px-2 py-0.5 sm:py-1 rounded bg-red-500/20 text-red-400">
              unread
            </span>
          )}

        </div>

        {n.message && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1 break-words">
            {n.message}
          </p>
        )}

        <p className="text-xs text-slate-500 mt-1">
          {new Date(n.createdAt).toLocaleString()}
        </p>

      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2 justify-start sm:justify-end">

        <button
          onClick={() => onReadToggle?.(n)}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          {n.read ? 'Unread' : 'Read'}
        </button>

        <button
          onClick={() => onDelete?.(n)}
          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-xs transition-colors"
        >
          Delete
        </button>

      </div>
    </div>
  )
}