// src/components/ItemDetailsModal.jsx
export default function ItemDetailsModal({ item, onClose }) {
  if (!item) return null

  const fmtDate = (d, withTime = false) => {
    try {
      const date = new Date(d)
      return withTime ? date.toLocaleString() : date.toLocaleDateString()
    } catch {
      return '-'
    }
  }

  const rows = [
    ['Name', item.name || '-'],
    ['Category', item.category || '-'],
    ['Status', item.status || '-'],
    ['Expiry', item.expiryDate ? fmtDate(item.expiryDate, true) : '-'],
    ['Estimated Cost', item.estimatedCost != null ? `₹${item.estimatedCost}` : '-'],
    ['Barcode', item.barcode || '-'],
    ['Brand', item.brand || '-'],
    ['Quantity', item.quantity != null ? `${item.quantity} ${item.unit || ''}` : '-'],
    ['Location', item.location || '-'],
    ['Purchase Date', item.purchaseDate ? fmtDate(item.purchaseDate) : '-'],
    ['Opened At', item.openedAt ? fmtDate(item.openedAt) : '-'],
    ['Notes', item.notes || '-'],
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="w-full max-w-lg bg-slate-900/70 rounded-xl border border-slate-800/50 shadow-lg p-4 sm:p-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
          <h3 className="text-xl sm:text-2xl font-semibold text-cyan-400">Item details</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            aria-label="Close item details"
          >
            ✕
          </button>
        </div>

        <div className="divide-y divide-slate-800/50 overflow-y-auto flex-1">
          {rows.map(([label, value]) => (
            <div key={label} className="py-2.5 sm:py-3 flex items-start justify-between gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-slate-400 flex-shrink-0 w-28 sm:w-32">{label}</span>
              <span className="text-xs sm:text-sm font-medium text-slate-200 text-right break-words min-w-0">
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-5 text-right flex-shrink-0">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700/50 bg-slate-800/60 text-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-700/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}