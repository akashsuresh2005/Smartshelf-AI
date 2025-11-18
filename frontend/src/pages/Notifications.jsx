// // src/pages/Notifications.jsx
// import { useEffect, useMemo, useState } from 'react';
// import { motion } from 'framer-motion';
// import api from '../utils/api.js';
// import NotificationItem from '../components/NotificationItem.jsx';
// import NotificationPrefs from '../components/NotificationPrefs.jsx';

// export default function Notifications() {
//   const [q, setQ] = useState('');
//   const [type, setType] = useState('');
//   const [status, setStatus] = useState('all');
//   const [from, setFrom] = useState('');
//   const [to, setTo] = useState('');

//   const [sort, setSort] = useState('createdAt');
//   const [order, setOrder] = useState('desc');
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);

//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [unread, setUnread] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const pages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit]);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const [{ data }, statsRes] = await Promise.all([
//         api.get('/notifications', {
//           params: { q, type, status, from, to, sort, order, page, limit }
//         }),
//         api.get('/notifications/stats')
//       ]);
//       setItems(data.items || []);
//       setTotal(data.total || 0);
//       setUnread(statsRes.data?.unread || 0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, type, status, from, to, sort, order, page, limit]);

//   const showAll = () => { setStatus('all'); setType(''); setQ(''); setFrom(''); setTo(''); setPage(1); };
//   const showSent = () => { setStatus('all'); setType('email'); setQ(''); setFrom(''); setTo(''); setPage(1); };
//   const showPending = () => { setStatus('unread'); setType(''); setQ(''); setFrom(''); setTo(''); setPage(1); };

//   const toggleRead = async (n) => {
//     await api.patch('/notifications/mark', { ids: [n._id], read: !n.read });
//     load();
//   };

//   const remove = async (n) => {
//     if (!confirm('Delete this notification?')) return;
//     await api.delete(`/notifications/${n._id}`);
//     if (items.length === 1 && page > 1) setPage(page - 1);
//     else load();
//   };

//   return (
//     <div className="bg-slate-950 min-h-screen p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-semibold text-cyan-400">Notifications</h1>
//         <div className="text-base text-slate-400">
//           <span className="text-cyan-400 font-semibold">{total}</span> total •{' '}
//           <span className="text-yellow-400 font-semibold">{unread}</span> unread
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
//           <input
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//             placeholder="Search title/message"
//             value={q}
//             onChange={(e) => { setQ(e.target.value); setPage(1); }}
//           />
//           <select
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//             value={type}
//             onChange={(e) => { setType(e.target.value); setPage(1); }}
//           >
//             <option value="">All types</option>
//             <option value="email">Email</option>
//             <option value="push">Push</option>
//             <option value="system">System</option>
//           </select>
//           <select
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//             value={status}
//             onChange={(e) => { setStatus(e.target.value); setPage(1); }}
//           >
//             <option value="all">Any status</option>
//             <option value="unread">Unread</option>
//             <option value="read">Read</option>
//           </select>
//           <input
//             type="date"
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//             value={from}
//             onChange={(e) => { setFrom(e.target.value); setPage(1); }}
//           />
//           <input
//             type="date"
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//             value={to}
//             onChange={(e) => { setTo(e.target.value); setPage(1); }}
//           />
//           <div className="flex gap-2">
//             <select
//               className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
//               value={sort}
//               onChange={(e) => setSort(e.target.value)}
//             >
//               <option value="createdAt">Sort: Date</option>
//               <option value="title">Sort: Title</option>
//               <option value="type">Sort: Type</option>
//               <option value="read">Sort: Read</option>
//             </select>
//             <button
//               className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-sm hover:bg-slate-700/60 transition-colors"
//               onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
//             >
//               {order === 'asc' ? 'Asc ↑' : 'Desc ↓'}
//             </button>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 py-1 text-sm hover:bg-slate-700/60 transition-colors"
//             onClick={showAll}
//           >
//             Show All
//           </button>
//           <button
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 py-1 text-sm hover:bg-slate-700/60 transition-colors"
//             onClick={showSent}
//           >
//             Show Sent
//           </button>
//           <button
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 py-1 text-sm hover:bg-slate-700/60 transition-colors"
//             onClick={showPending}
//           >
//             Show Pending
//           </button>
//         </div>
//       </div>

//       {/* Notifications list */}
//       <div className="space-y-3">
//         {loading ? (
//           <div className="text-slate-500 text-base py-6">Loading…</div>
//         ) : items.length ? (
//           items.map((n) => (
//             <motion.div
//               key={n._id}
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.18 }}
//               className="bg-slate-900/60 rounded-lg border border-slate-800/50"
//             >
//               <NotificationItem n={n} onReadToggle={toggleRead} onDelete={remove} />
//             </motion.div>
//           ))
//         ) : (
//           <div className="bg-slate-900/60 rounded-lg p-6 border border-slate-800/50 text-slate-500">
//             No notifications match your filters.
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between">
//         <div className="text-base text-slate-400">Page {page} / {pages}</div>
//         <div className="flex items-center gap-2">
//           <select
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
//             value={limit}
//             onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
//           >
//             {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
//           </select>
//           <button
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2 text-sm hover:bg-slate-700/60 transition-colors disabled:opacity-50"
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={page <= 1}
//           >
//             Prev
//           </button>
//           <button
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2 text-sm hover:bg-slate-700/60 transition-colors disabled:opacity-50"
//             onClick={() => setPage((p) => Math.min(pages, p + 1))}
//             disabled={page >= pages}
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* Preferences */}
//       <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
//         <h2 className="text-lg font-medium text-slate-300 mb-3">Preferences</h2>
//         <NotificationPrefs />
//       </div>
//     </div>
//   );
// }
// src/pages/Notifications.jsx
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api.js';
import NotificationItem from '../components/NotificationItem.jsx';
import NotificationPrefs from '../components/NotificationPrefs.jsx';

export default function Notifications() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const pages = useMemo(() => Math.max(Math.ceil((total || 0) / (limit || 1)), 1), [total, limit]);

  const load = async () => {
    setLoading(true);
    try {
      // api.get returns res.data (not the full axios response). Normalize both responses.
      const [dataResp, statsResp] = await Promise.all([
        api.get('/notifications', {
          params: { q, type, status, from, to, sort, order, page, limit }
        }),
        api.get('/notifications/stats')
      ]);

      // Normalize notifications response:
      // server may return an array OR an object { items: [], total: N }
      const normalizedItems = Array.isArray(dataResp) ? dataResp : (dataResp?.items ?? []);
      const normalizedTotal = typeof dataResp?.total === 'number' ? dataResp.total : (Array.isArray(dataResp) ? dataResp.length : normalizedItems.length);

      setItems(Array.isArray(normalizedItems) ? normalizedItems : []);
      setTotal(typeof normalizedTotal === 'number' ? normalizedTotal : 0);

      // statsResp may be object { unread: N } or something else
      const stats = statsResp ?? {};
      setUnread(typeof stats.unread === 'number' ? stats.unread : (stats?.unreadCount ?? 0));
    } catch (err) {
      console.error('[Notifications] load error', err);
      setItems([]);
      setTotal(0);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, type, status, from, to, sort, order, page, limit]);

  const showAll = () => { setStatus('all'); setType(''); setQ(''); setFrom(''); setTo(''); setPage(1); };
  const showSent = () => { setStatus('all'); setType('email'); setQ(''); setFrom(''); setTo(''); setPage(1); };
  const showPending = () => { setStatus('unread'); setType(''); setQ(''); setFrom(''); setTo(''); setPage(1); };

  const toggleRead = async (n) => {
    try {
      await api.patch('/notifications/mark', { ids: [n._id], read: !n.read });
      await load();
    } catch (err) {
      console.error('[Notifications] toggleRead error', err);
    }
  };

  const remove = async (n) => {
    if (!confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/${n._id}`);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (err) {
      console.error('[Notifications] remove error', err);
      alert('Failed to delete notification');
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-cyan-400">Notifications</h1>
        <div className="text-base text-slate-400">
          <span className="text-cyan-400 font-semibold">{total}</span> total •{' '}
          <span className="text-yellow-400 font-semibold">{unread}</span> unread
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
            placeholder="Search title/message"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
          <select
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          >
            <option value="">All types</option>
            <option value="email">Email</option>
            <option value="push">Push</option>
            <option value="system">System</option>
          </select>
          <select
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="all">Any status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <input
            type="date"
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          />
          <input
            type="date"
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
          />
          <div className="flex gap-2">
            <select
              className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="createdAt">Sort: Date</option>
              <option value="title">Sort: Title</option>
              <option value="type">Sort: Type</option>
              <option value="read">Sort: Read</option>
            </select>
            <button
              className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-sm hover:bg-slate-700/60 transition-colors"
              onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            >
              {order === 'asc' ? 'Asc ↑' : 'Desc ↓'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 py-1 text-sm hover:bg-slate-700/60 transition-colors"
            onClick={showAll}
          >
            Show All
          </button>
          <button
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 py-1 text-sm hover:bg-slate-700/60 transition-colors"
            onClick={showSent}
          >
            Show Sent
          </button>
          <button
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 py-1 text-sm hover:bg-slate-700/60 transition-colors"
            onClick={showPending}
          >
            Show Pending
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-slate-500 text-base py-6">Loading…</div>
        ) : items.length ? (
          items.map((n) => (
            <motion.div
              key={n._id || n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-slate-900/60 rounded-lg border border-slate-800/50"
            >
              <NotificationItem n={n} onReadToggle={toggleRead} onDelete={remove} />
            </motion.div>
          ))
        ) : (
          <div className="bg-slate-900/60 rounded-lg p-6 border border-slate-800/50 text-slate-500">
            No notifications match your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-base text-slate-400">Page {page} / {pages}</div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <button
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2 text-sm hover:bg-slate-700/60 transition-colors disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2 text-sm hover:bg-slate-700/60 transition-colors disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50">
        <h2 className="text-lg font-medium text-slate-300 mb-3">Preferences</h2>
        <NotificationPrefs />
      </div>
    </div>
  );
}
