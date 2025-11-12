// import { useEffect, useState } from 'react';
// import api from '../utils/api.js';

// export default function NotificationPrefs() {
//   const [prefs, setPrefs] = useState({
//     emailEnabled: true,
//     expiringSoon: true,
//     expired: true,
//     digestDaily: false,
//     digestWeekly: true
//   });
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await api.get('/notifications/prefs');
//         setPrefs({ ...prefs, ...data });
//       } catch {}
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const onToggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

//   const onSave = async () => {
//     try {
//       setSaving(true);
//       await api.put('/notifications/prefs', prefs);
//       setSaved(true);
//       setTimeout(() => setSaved(false), 1500);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="card p-4 space-y-3">
//       <h3 className="font-medium">Manage your email notifications & preferences</h3>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//         <label className="flex items-center gap-2">
//           <input type="checkbox" checked={prefs.emailEnabled} onChange={() => onToggle('emailEnabled')} />
//           <span>Email notifications enabled</span>
//         </label>
//         <label className="flex items-center gap-2">
//           <input type="checkbox" checked={prefs.expiringSoon} onChange={() => onToggle('expiringSoon')} />
//           <span>Notify on expiring soon</span>
//         </label>
//         <label className="flex items-center gap-2">
//           <input type="checkbox" checked={prefs.expired} onChange={() => onToggle('expired')} />
//           <span>Notify on expired items</span>
//         </label>
//         <label className="flex items-center gap-2">
//           <input type="checkbox" checked={prefs.digestDaily} onChange={() => onToggle('digestDaily')} />
//           <span>Daily digest email</span>
//         </label>
//         <label className="flex items-center gap-2">
//           <input type="checkbox" checked={prefs.digestWeekly} onChange={() => onToggle('digestWeekly')} />
//           <span>Weekly digest email</span>
//         </label>
//       </div>

//       <div className="flex items-center gap-2">
//         <button className="rounded bg-blue-600 text-white px-3 py-1" onClick={onSave} disabled={saving}>
//           {saving ? 'Saving…' : 'Save preferences'}
//         </button>
//         {saved && <span className="text-sm text-green-600">Saved!</span>}
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import api from '../utils/api.js';

export default function NotificationPrefs() {
  const [prefs, setPrefs] = useState({
    emailEnabled: true,
    expiringSoon: true,
    expired: true,
    digestDaily: false,
    digestWeekly: false
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/notifications/prefs');
    setPrefs({
      emailEnabled: !!data.emailEnabled,
      expiringSoon: !!data.expiringSoon,
      expired: !!data.expired,
      digestDaily: !!data.digestDaily,
      digestWeekly: !!data.digestWeekly
    });
  };

  useEffect(() => { load(); }, []);

  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/notifications/prefs', prefs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-medium">Manage your email notifications & preferences</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={prefs.emailEnabled} onChange={() => toggle('emailEnabled')} />
          <span>Email notifications enabled</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={prefs.expiringSoon} onChange={() => toggle('expiringSoon')} />
          <span>Notify when items are expiring soon</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={prefs.expired} onChange={() => toggle('expired')} />
          <span>Notify when items are expired</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={prefs.digestDaily} onChange={() => toggle('digestDaily')} />
          <span>Daily email digest</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={prefs.digestWeekly} onChange={() => toggle('digestWeekly')} />
          <span>Weekly email digest</span>
        </label>
      </div>

      <div>
        <button className="rounded bg-blue-600 text-white px-4 py-2" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </div>
  );
}
