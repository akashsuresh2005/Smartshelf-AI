// // // src/components/ItemCard.jsx
// // import classNames from 'classnames'

// // const badgeTailwind = (category) => ({
// //   grocery: 'bg-emerald-500 text-white',
// //   medicine: 'bg-blue-500 text-white',
// //   cosmetic: 'bg-pink-500 text-white',
// //   beverage: 'bg-amber-500 text-white',
// //   other: 'bg-slate-500 text-white'
// // }[category] || 'bg-slate-500 text-white')

// // export default function ItemCard({ item, onClick, onEdit, onDelete }) {
// //   const expiry = item?.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'
// //   const statusColor = {
// //     fresh: 'text-green-300',
// //     expiring: 'text-yellow-300',
// //     expired: 'text-red-300'
// //   }[item?.status] || 'text-slate-300'

// //   return (
// //     // ensure each card is a vertical flex with buttons pinned to bottom
// //     <div className="bg-slate-900/60 rounded-lg border border-slate-800/50 p-4 flex flex-col h-full">
// //       <div className="flex justify-between items-start gap-3">
// //         <button
// //           type="button"
// //           className="text-left flex-1"
// //           onClick={onClick}
// //           aria-label={`View details for ${item?.name || 'item'}`}
// //         >
// //           <h4 className="text-lg font-semibold text-slate-200 truncate">{item.name}</h4>
// //           {item.dosage && <p className="text-sm text-slate-400">{item.dosage}</p>}
// //           {item.brand && <p className="text-xs text-slate-500 mt-0.5 truncate">Brand: {item.brand}</p>}
// //         </button>

// //         {/* category badge - always visible */}
// //         <div
// //           className={classNames(
// //             'text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ml-2',
// //             badgeTailwind(item.category)
// //           )}
// //           title={`Category: ${item.category}`}
// //         >
// //           {item.category?.charAt(0)?.toUpperCase() + item.category?.slice(1)}
// //         </div>
// //       </div>

// //       <div className="mt-3 grid grid-cols-2 gap-2 text-sm flex-1">
// //         <p className="text-slate-400">
// //           <span className="text-slate-500">Expiry:</span> {expiry}
// //         </p>
// //         <p className="text-slate-400">
// //           <span className="text-slate-500">Status:</span>{' '}
// //           <strong className={statusColor}>{item.status}</strong>
// //         </p>
// //         {item.quantity != null && (
// //           <p className="text-slate-400">
// //             <span className="text-slate-500">Qty:</span> {item.quantity} {item.unit || ''}
// //           </p>
// //         )}
// //         {item.location && (
// //           <p className="text-slate-400">
// //             <span className="text-slate-500">Location:</span> {item.location}
// //           </p>
// //         )}
// //       </div>

// //       {/* actions pinned to bottom */}
// //       <div className="mt-4 flex gap-2 items-center">
// //         <button
// //           className="rounded-lg border border-slate-700/50 bg-slate-800/60 text-slate-200 px-3 py-1.5 text-sm hover:bg-slate-700/60 transition-colors"
// //           onClick={onClick}
// //         >
// //           Details
// //         </button>
// //         <button
// //           className="rounded-lg bg-amber-500 text-slate-900 px-3 py-1.5 text-sm font-medium hover:bg-amber-400 transition-colors"
// //           onClick={onEdit}
// //         >
// //           Edit
// //         </button>
// //         <button
// //           className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-red-500 transition-colors"
// //           onClick={onDelete}
// //         >
// //           Delete
// //         </button>
// //       </div>
// //     </div>
// //   )
// // }
// // frontend/src/components/ItemCard.jsx
// import { useState } from 'react'
// import classNames from 'classnames'
// import api from '../utils/api.js' // make sure api is available here

// const badgeClass = (category) => ({
//   grocery: 'badge-grocery',
//   medicine: 'badge-medicine',
//   cosmetic: 'badge-cosmetic',
//   beverage: 'badge-beverage',
//   other: 'badge-other'
// }[category] || 'badge-other')

// export default function ItemCard({ item, onClick, onEdit, onDelete, onUpdated }) {
//   const [busy, setBusy] = useState(false)

//   const expiry = item?.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'
//   const statusColor = {
//     fresh: 'text-green-300',
//     expiring: 'text-yellow-300',
//     expired: 'text-red-300'
//   }[item?.status] || 'text-slate-300'

//   const handleMarkConsumed = async () => {
//     if (!confirm(`Mark "${item.name}" as consumed?`)) return
//     try {
//       setBusy(true)
//       const payload = { status: 'consumed', consumedAt: new Date().toISOString() }
//       const { data } = await api.put(`/items/${item._id}`, payload)
//       // call parent to refresh or update
//       if (typeof onUpdated === 'function') onUpdated(data)
//     } catch (err) {
//       console.error('Mark consumed failed', err)
//       alert('Failed to mark as consumed')
//     } finally {
//       setBusy(false)
//     }
//   }

//   return (
//     <div className="bg-slate-900/60 rounded-lg border border-slate-800/50 p-4 transition-transform hover:scale-[1.01]">
//       <div className="flex justify-between items-start gap-3">
//         <button
//           type="button"
//           className="text-left flex-1"
//           onClick={onClick}
//           aria-label={`View details for ${item?.name || 'item'}`}
//         >
//           <h4 className="text-lg font-semibold text-slate-200">{item.name}</h4>
//           {item.dosage && <p className="text-sm text-slate-400">{item.dosage}</p>}
//           {item.brand && <p className="text-xs text-slate-500 mt-0.5">Brand: {item.brand}</p>}
//         </button>

//         <div
//           className={classNames(
//             'px-2 py-1 text-xs rounded font-medium',
//             badgeClass(item.category),
//             'border border-slate-800/50'
//           )}
//           title={`Category: ${item.category}`}
//         >
//           {item.category}
//         </div>
//       </div>

//       <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
//         <p className="text-slate-400">
//           <span className="text-slate-500">Expiry:</span> {expiry}
//         </p>
//         <p className="text-slate-400">
//           <span className="text-slate-500">Status:</span>{' '}
//           <strong className={statusColor}>{item.status}</strong>
//         </p>
//         {item.quantity != null && (
//           <p className="text-slate-400">
//             <span className="text-slate-500">Qty:</span> {item.quantity} {item.unit || ''}
//           </p>
//         )}
//         {item.location && (
//           <p className="text-slate-400">
//             <span className="text-slate-500">Location:</span> {item.location}
//           </p>
//         )}
//       </div>

//       <div className="mt-4 flex flex-wrap gap-2">
//         <button
//           className="rounded-lg border border-slate-700/50 bg-slate-800/60 text-slate-200 px-3 py-1.5 text-sm hover:bg-slate-700/60 transition-colors"
//           onClick={onClick}
//         >
//           Details
//         </button>

//         <button
//           className="rounded-lg bg-amber-500 text-slate-900 px-3 py-1.5 text-sm font-medium hover:bg-amber-400 transition-colors"
//           onClick={onEdit}
//         >
//           Edit
//         </button>

//         <button
//           className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-red-500 transition-colors"
//           onClick={onDelete}
//         >
//           Delete
//         </button>

//         {/* NEW: Mark consumed */}
//         {item.status !== 'consumed' && (
//           <button
//             className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-indigo-500 transition-colors"
//             onClick={handleMarkConsumed}
//             disabled={busy}
//             title="Mark as consumed"
//           >
//             {busy ? 'Please wait…' : 'Mark consumed'}
//           </button>
//         )}

//         {item.status === 'consumed' && (
//           <span className="px-3 py-1 text-xs rounded bg-slate-800/70 text-slate-300">Consumed</span>
//         )}
//       </div>
//     </div>
//   )
// }
// frontend/src/components/ItemCard.jsx
import { useState } from 'react'
import classNames from 'classnames'
import api from '../utils/api.js'

// Category color mapping - using solid colors for visibility
const badgeTailwind = (category) => ({
  grocery: 'bg-emerald-500 text-white',
  medicine: 'bg-blue-500 text-white',
  cosmetic: 'bg-pink-500 text-white',
  beverage: 'bg-amber-500 text-white',
  electronics: 'bg-purple-500 text-white',
  clothing: 'bg-orange-500 text-white',
  household: 'bg-cyan-500 text-white',
  food: 'bg-green-500 text-white',
  stationery: 'bg-yellow-500 text-slate-900',
  other: 'bg-slate-500 text-white'
}[category] || 'bg-slate-500 text-white')

export default function ItemCard({ item, onClick, onEdit, onDelete, onUpdated }) {
  const [busy, setBusy] = useState(false)

  const expiry = item?.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'
  const statusColor = {
    fresh: 'text-green-300',
    expiring: 'text-yellow-300',
    expired: 'text-red-300'
  }[item?.status] || 'text-slate-300'

  const handleMarkConsumed = async () => {
    if (!confirm(`Mark "${item.name}" as consumed?`)) return
    try {
      setBusy(true)
      const payload = { status: 'consumed', consumedAt: new Date().toISOString() }
      const { data } = await api.put(`/items/${item._id}`, payload)
      if (typeof onUpdated === 'function') onUpdated(data)
    } catch (err) {
      console.error('Mark consumed failed', err)
      alert('Failed to mark as consumed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-slate-900/60 rounded-lg border border-slate-800/50 p-4 transition-transform hover:scale-[1.01]">
      <div className="flex justify-between items-start gap-3">
        <button
          type="button"
          className="text-left flex-1"
          onClick={onClick}
          aria-label={`View details for ${item?.name || 'item'}`}
        >
          <h4 className="text-lg font-semibold text-slate-200">{item.name}</h4>
          {item.dosage && <p className="text-sm text-slate-400">{item.dosage}</p>}
          {item.brand && <p className="text-xs text-slate-500 mt-0.5">Brand: {item.brand}</p>}
        </button>

        {/* Category Badge with distinct colors */}
        <div
          className={classNames(
            'px-2 py-1 text-xs rounded font-medium',
            badgeTailwind(item.category),
            'border border-slate-800/50'
          )}
          title={`Category: ${item.category}`}
        >
          {item.category}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <p className="text-slate-400">
          <span className="text-slate-500">Expiry:</span> {expiry}
        </p>
        <p className="text-slate-400">
          <span className="text-slate-500">Status:</span>{' '}
          <strong className={statusColor}>{item.status}</strong>
        </p>
        {item.quantity != null && (
          <p className="text-slate-400">
            <span className="text-slate-500">Qty:</span> {item.quantity} {item.unit || ''}
          </p>
        )}
        {item.location && (
          <p className="text-slate-400">
            <span className="text-slate-500">Location:</span> {item.location}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded-lg border border-slate-700/50 bg-slate-800/60 text-slate-200 px-3 py-1.5 text-sm hover:bg-slate-700/60 transition-colors"
          onClick={onClick}
        >
          Details
        </button>

        <button
          className="rounded-lg bg-amber-500 text-slate-900 px-3 py-1.5 text-sm font-medium hover:bg-amber-400 transition-colors"
          onClick={onEdit}
        >
          Edit
        </button>

        <button
          className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-red-500 transition-colors"
          onClick={onDelete}
        >
          Delete
        </button>

        {/* Mark consumed button */}
        {item.status !== 'consumed' && (
          <button
            className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-indigo-500 transition-colors"
            onClick={handleMarkConsumed}
            disabled={busy}
            title="Mark as consumed"
          >
            {busy ? 'Please wait…' : 'Mark consumed'}
          </button>
        )}

        {item.status === 'consumed' && (
          <span className="px-3 py-1 text-xs rounded bg-slate-800/70 text-slate-300">Consumed</span>
        )}
      </div>
    </div>
  )
}