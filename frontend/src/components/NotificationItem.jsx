// import { memo } from 'react';

// function badge(type) {
//   if (type === 'email') return 'bg-blue-100 text-blue-700';
//   if (type === 'push') return 'bg-purple-100 text-purple-700';
//   return 'bg-gray-100 text-gray-700';
// }

// export default memo(function NotificationItem({ n, onReadToggle, onDelete }) {
//   const d = new Date(n.createdAt);
//   const dateStr = `${d.toLocaleDateString()} • ${d.toLocaleTimeString()}`;

//   return (
//     <div className="card p-4 flex items-start justify-between gap-4">
//       <div>
//         <div className="flex items-center gap-2">
//           <span className="font-medium">{n.title}</span>
//           <span className={`text-xs px-2 py-0.5 rounded-full ${badge(n.type)}`}>{n.type}</span>
//           {!n.read && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">unread</span>}
//         </div>
//         <p className="text-sm text-gray-600 mt-1">{n.message}</p>
//         <p className="text-xs text-gray-400 mt-1">{dateStr}</p>
//       </div>

//       <div className="flex items-center gap-2">
//         <button
//           className="text-xs rounded border px-2 py-1"
//           onClick={() => onReadToggle(n)}
//           title={n.read ? 'Mark as unread' : 'Mark as read'}
//         >
//           {n.read ? 'Mark unread' : 'Mark read'}
//         </button>
//         <button
//           className="text-xs rounded border px-2 py-1"
//           onClick={() => onDelete(n)}
//           title="Delete notification"
//         >
//           Delete
//         </button>
//       </div>
//     </div>
//   );
// });
export default function NotificationItem({ n, onReadToggle, onDelete }) {
  return (
    <div className="card p-4 flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{n.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${n.type === 'email' ? 'bg-blue-100 text-blue-700' :
            n.type === 'push' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {n.type}
          </span>
          {!n.read && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">unread</span>}
        </div>
        <p className="text-sm text-gray-600 mt-1">{n.message}</p>
        <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded border px-3 py-1 text-sm" onClick={() => onReadToggle?.(n)}>
          {n.read ? 'Mark unread' : 'Mark read'}
        </button>
        <button className="rounded bg-red-600 text-white px-3 py-1 text-sm" onClick={() => onDelete?.(n)}>Delete</button>
      </div>
    </div>
  );
}

