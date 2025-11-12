// import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import api from '../utils/api.js'
// import { expiryBadge } from '../utils/helpers.js'

// export default function Notifications() {
//   const [items, setItems] = useState([])

//   useEffect(() => {
//     api.get('/api/items').then(({ data }) => setItems(data || []))
//   }, [])

//   const alerts = items
//     .filter((i) => i.expiry)
//     .sort((a, b) => new Date(a.expiry) - new Date(b.expiry))

//   return (
//     <div>
//       <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
//       <div className="space-y-3">
//         {alerts.map((i) => {
//           const badge = expiryBadge(i.expiry)
//           return (
//             <motion.div key={i._id || i.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 flex items-center justify-between">
//               <div>
//                 <p className="font-medium">{i.name}</p>
//                 <p className="text-sm text-gray-500">Expires: {new Date(i.expiry).toLocaleDateString()}</p>
//               </div>
//               <span className={`px-3 py-1 rounded-full text-xs ${badge.color}`}>{badge.label}</span>
//             </motion.div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }
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

  const pages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit]);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data }, statsRes] = await Promise.all([
        api.get('/notifications', {
          params: { q, type, status, from, to, sort, order, page, limit }
        }),
        api.get('/notifications/stats')
      ]);
      setItems(data.items || []);
      setTotal(data.total || 0);
      setUnread(statsRes.data?.unread || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, type, status, from, to, sort, order, page, limit]);

  const showAll = () => { setStatus('all'); setType(''); setQ(''); setFrom(''); setTo(''); setPage(1); };
  const showSent = () => { setStatus('all'); setType('email'); setQ(''); setFrom(''); setTo(''); setPage(1); };
  const showPending = () => { setStatus('unread'); setType(''); setQ(''); setFrom(''); setTo(''); setPage(1); };

  const toggleRead = async (n) => {
    await api.patch('/notifications/mark', { ids: [n._id], read: !n.read });
    load();
  };

  const remove = async (n) => {
    if (!confirm('Delete this notification?')) return;
    await api.delete(`/notifications/${n._id}`);
    if (items.length === 1 && page > 1) setPage(page - 1);
    else load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="text-sm text-gray-500">Total: {total} • Unread: {unread}</div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="rounded border px-3 py-2" placeholder="Search title/message" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <select className="rounded border px-3 py-2" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
            <option value="">All types</option>
            <option value="email">Email</option>
            <option value="push">Push</option>
            <option value="system">System</option>
          </select>
          <select className="rounded border px-3 py-2" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="all">Any status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <input type="date" className="rounded border px-3 py-2" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          <input type="date" className="rounded border px-3 py-2" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          <div className="flex gap-2">
            <select className="rounded border px-3 py-2" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="createdAt">Sort: Date</option>
              <option value="title">Sort: Title</option>
              <option value="type">Sort: Type</option>
              <option value="read">Sort: Read</option>
            </select>
            <button className="rounded border px-3 py-2" onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}>
              {order === 'asc' ? 'Asc ↑' : 'Desc ↓'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded border px-3 py-1 text-sm" onClick={showAll}>Show All</button>
          <button className="rounded border px-3 py-1 text-sm" onClick={showSent}>Show Sent</button>
          <button className="rounded border px-3 py-1 text-sm" onClick={showPending}>Show Pending</button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p>Loading…</p>
        ) : items.length ? (
          items.map((n) => (
            <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <NotificationItem n={n} onReadToggle={toggleRead} onDelete={remove} />
            </motion.div>
          ))
        ) : (
          <div className="card p-6 text-gray-500">No notifications match your filters.</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Page {page} / {pages}</div>
        <div className="flex items-center gap-2">
          <select className="rounded border px-2 py-1 text-sm" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
            {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <button className="rounded border px-3 py-1" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
          <button className="rounded border px-3 py-1" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>Next</button>
        </div>
      </div>

      <NotificationPrefs />
    </div>
  );
}
