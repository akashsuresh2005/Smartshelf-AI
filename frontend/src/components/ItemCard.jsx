
// src/components/ItemCard.jsx
import classNames from 'classnames'

const badgeClass = (category) => ({
  grocery: 'badge-grocery',
  medicine: 'badge-medicine',
  cosmetic: 'badge-cosmetic',
  beverage: 'badge-beverage',
  other: 'badge-other'
}[category] || 'badge-other')

export default function ItemCard({ item, onClick, onEdit, onDelete }) {
  const expiry = item?.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'
  const statusColor = {
    fresh: 'text-green-300',
    expiring: 'text-yellow-300',
    expired: 'text-red-300'
  }[item?.status] || 'text-slate-300'

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

        <div
          className={classNames(
            'px-2 py-1 text-xs rounded font-medium',
            badgeClass(item.category),
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
      </div>
    </div>
  )
}
