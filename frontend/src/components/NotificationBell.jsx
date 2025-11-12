// import { useEffect, useState } from 'react'
// import api from '../utils/api.js'

// export default function NotificationBell() {
//   const [count, setCount] = useState(0)

//   useEffect(() => {
//     const poll = async () => {
//       try {
//         const { data } = await api.get('/api/notifications/unread-count')
//         setCount(data?.count || 0)
//       } catch {}
//     }
//     poll()
//     const id = setInterval(poll, 10000)
//     return () => clearInterval(id)
//   }, [])

//   return (
//     <div className="relative">
//       <span className="text-2xl">🔔</span>
//       {count > 0 && (
//         <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{count}</span>
//       )}
//     </div>
//   )
// }
import { useEffect, useState } from 'react';
import api from '../utils/api.js';

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const poll = async () => {
      try {
        // baseURL already has /api -> use "/notifications/unread-count"
        const { data } = await api.get('/notifications/unread-count');
        setCount(data?.count ?? 0);
      } catch {
        // ignore errors silently for the badge
      }
    };
    poll();
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <span className="text-2xl">🔔</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}
