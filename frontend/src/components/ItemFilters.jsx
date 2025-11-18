// // src/components/ItemFilters.jsx
// import { useEffect, useState } from 'react'
// import api from '../utils/api.js'

// export default function ItemFilters({ onData, onLoadingChange }) {
//   const [total, setTotal] = useState(0)
//   const [page, setPage] = useState(1)
//   const [filters, setFilters] = useState({
//     category: '',
//     status: '',
//     q: '',
//     minCost: '',
//     maxCost: '',
//     sort: 'expiryDate',
//     order: 'asc',
//     limit: 12,
//   })

//   const load = async () => {
//     onLoadingChange?.(true)
//     try {
//       const { data } = await api.get('/items', { params: { ...filters, page } })
//       setTotal(data.total || 0)
//       onData?.(data.items || data || [])
//     } finally {
//       onLoadingChange?.(false)
//     }
//   }

//   useEffect(() => {
//     load()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [JSON.stringify(filters), page])

//   const pages = Math.max(Math.ceil(total / (filters.limit || 12)), 1)

//   const inputCls = 'w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors'
//   const btnCls = 'rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-sm hover:bg-slate-700/60 transition-colors'

//   return (
//     <div className="space-y-4">
//       {/* Filters */}
//       <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
//           <input
//             className={inputCls}
//             placeholder="Search name / brand / barcode"
//             value={filters.q}
//             onChange={(e) => setFilters(f => ({ ...f, q: e.target.value })) }
//           />

//           <select
//             className={inputCls}
//             value={filters.category}
//             onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
//           >
//             <option value="">All categories</option>
//             <option value="grocery">Grocery</option>
//             <option value="medicine">Medicine</option>
//             <option value="cosmetic">Cosmetic</option>
//             <option value="beverage">Beverage</option>
//             <option value="other">Other</option>
//           </select>

//           <select
//             className={inputCls}
//             value={filters.status}
//             onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
//           >
//             <option value="">Any status</option>
//             <option value="active">Active</option>
//             <option value="expired">Expired</option>
//             <option value="consumed">Consumed</option>
//           </select>

//           <div className="flex gap-3">
//             <input
//               className={`${inputCls} w-1/2`}
//               type="number"
//               placeholder="Min ₹"
//               value={filters.minCost}
//               onChange={(e) => setFilters(f => ({ ...f, minCost: e.target.value }))}
//             />
//             <input
//               className={`${inputCls} w-1/2`}
//               type="number"
//               placeholder="Max ₹"
//               value={filters.maxCost}
//               onChange={(e) => setFilters(f => ({ ...f, maxCost: e.target.value }))}
//             />
//           </div>

//           <select
//             className={inputCls}
//             value={filters.sort}
//             onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
//           >
//             <option value="expiryDate">Sort: Expiry</option>
//             <option value="createdAt">Sort: Newest</option>
//             <option value="estimatedCost">Sort: Cost</option>
//             <option value="name">Sort: Name</option>
//           </select>

//           <button
//             className={btnCls}
//             onClick={() => setFilters(f => ({ ...f, order: f.order === 'asc' ? 'desc' : 'asc' }))}
//             title="Toggle order"
//           >
//             {filters.order === 'asc' ? 'Asc ↑' : 'Desc ↓'}
//           </button>
//         </div>

//         {/* Apply page reset when filters change */}
//         <div className="text-xs text-slate-500">
//           Tip: Changing filters updates results automatically.
//         </div>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between">
//         <p className="text-base text-slate-400">
//           Page {page} / {pages} • <span className="text-cyan-400 font-semibold">{total}</span> items
//         </p>
//         <div className="flex items-center gap-2">
//           <select
//             className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
//             value={filters.limit}
//             onChange={(e) => {
//               const val = Number(e.target.value)
//               setFilters(f => ({ ...f, limit: val }))
//               setPage(1)
//             }}
//           >
//             {[12, 24, 36, 48].map(n => <option key={n} value={n}>{n} / page</option>)}
//           </select>

//           <button
//             className={`${btnCls} disabled:opacity-50`}
//             onClick={() => setPage(p => Math.max(1, p - 1))}
//             disabled={page <= 1}
//           >
//             Prev
//           </button>
//           <button
//             className={`${btnCls} disabled:opacity-50`}
//             onClick={() => setPage(p => Math.min(pages, p + 1))}
//             disabled={page >= pages}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }
// src/components/ItemFilters.jsx
import { useEffect, useState } from 'react'
import api from '../utils/api.js'

export default function ItemFilters({ onData, onLoadingChange }) {
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    q: '',
    minCost: '',
    maxCost: '',
    sort: 'expiryDate',
    order: 'asc',
    limit: 12,
  })

  const load = async () => {
    onLoadingChange?.(true)
    try {
      // api.get returns res.data (not the whole response)
      const data = await api.get('/items', { params: { ...filters, page } })
      // Normalize data: allow array or { items, total }
      const items = Array.isArray(data) ? data : (data?.items ?? [])
      const totalCount = typeof data?.total === 'number' ? data.total : (Array.isArray(data) ? data.length : 0)

      setTotal(totalCount)
      onData?.(items)
    } catch (err) {
      console.error('[ItemFilters] load error', err)
      setTotal(0)
      onData?.([])
    } finally {
      onLoadingChange?.(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), page])

  const pages = Math.max(Math.ceil((total || 0) / (filters.limit || 12)), 1)

  const inputCls = 'w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors'
  const btnCls = 'rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-4 py-2.5 text-sm hover:bg-slate-700/60 transition-colors'

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            className={inputCls}
            placeholder="Search name / brand / barcode"
            value={filters.q}
            onChange={(e) => setFilters(f => ({ ...f, q: e.target.value })) }
          />

          <select
            className={inputCls}
            value={filters.category}
            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">All categories</option>
            <option value="grocery">Grocery</option>
            <option value="medicine">Medicine</option>
            <option value="cosmetic">Cosmetic</option>
            <option value="beverage">Beverage</option>
            <option value="other">Other</option>
          </select>

          <select
            className={inputCls}
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="consumed">Consumed</option>
          </select>

          <div className="flex gap-3">
            <input
              className={`${inputCls} w-1/2`}
              type="number"
              placeholder="Min ₹"
              value={filters.minCost}
              onChange={(e) => setFilters(f => ({ ...f, minCost: e.target.value }))}
            />
            <input
              className={`${inputCls} w-1/2`}
              type="number"
              placeholder="Max ₹"
              value={filters.maxCost}
              onChange={(e) => setFilters(f => ({ ...f, maxCost: e.target.value }))}
            />
          </div>

          <select
            className={inputCls}
            value={filters.sort}
            onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
          >
            <option value="expiryDate">Sort: Expiry</option>
            <option value="createdAt">Sort: Newest</option>
            <option value="estimatedCost">Sort: Cost</option>
            <option value="name">Sort: Name</option>
          </select>

          <button
            className={btnCls}
            onClick={() => setFilters(f => ({ ...f, order: f.order === 'asc' ? 'desc' : 'asc' }))}
            title="Toggle order"
          >
            {filters.order === 'asc' ? 'Asc ↑' : 'Desc ↓'}
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Tip: Changing filters updates results automatically.
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-base text-slate-400">
          Page {page} / {pages} • <span className="text-cyan-400 font-semibold">{total}</span> items
        </p>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
            value={filters.limit}
            onChange={(e) => {
              const val = Number(e.target.value)
              setFilters(f => ({ ...f, limit: val }))
              setPage(1)
            }}
          >
            {[12, 24, 36, 48].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>

          <button
            className={`${btnCls} disabled:opacity-50`}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className={`${btnCls} disabled:opacity-50`}
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
