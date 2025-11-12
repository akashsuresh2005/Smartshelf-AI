// export default function ItemDetailsModal({ item, onClose }) {
//   if (!item) return null
//   const rows = [
//     ['Name', item.name],
//     ['Category', item.category],
//     ['Status', item.status],
//     ['Expiry', new Date(item.expiryDate).toLocaleString()],
//     ['Estimated Cost', item.estimatedCost != null ? `₹${item.estimatedCost}` : '-'],
//     ['Barcode', item.barcode || '-'],
//     ['Brand', item.brand || '-'],
//     ['Quantity', item.quantity != null ? `${item.quantity} ${item.unit || ''}` : '-'],
//     ['Location', item.location || '-'],
//     ['Purchase Date', item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '-'],
//     ['Opened At', item.openedAt ? new Date(item.openedAt).toLocaleDateString() : '-'],
//     ['Notes', item.notes || '-'],
//   ]

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
//       <div className="card p-5 w-full max-w-lg">
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="font-semibold">Item details</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>
//         <div className="space-y-2">
//           {rows.map(([k,v]) => (
//             <div key={k} className="flex items-start justify-between gap-4 text-sm">
//               <span className="text-gray-500">{k}</span>
//               <span className="font-medium text-right break-words">{v}</span>
//             </div>
//           ))}
//         </div>
//         <div className="mt-4 text-right">
//           <button onClick={onClose} className="rounded-lg bg-gray-100 px-3 py-1">Close</button>
//         </div>
//       </div>
//     </div>
//   )
// }
export default function ItemDetailsModal({ item, onClose }) {
  if (!item) return null
  const rows = [
    ['Name', item.name],
    ['Category', item.category],
    ['Status', item.status],
    ['Expiry', new Date(item.expiryDate).toLocaleString()],
    ['Estimated Cost', item.estimatedCost != null ? `₹${item.estimatedCost}` : '-'],
    ['Barcode', item.barcode || '-'],
    ['Brand', item.brand || '-'],
    ['Quantity', item.quantity != null ? `${item.quantity} ${item.unit || ''}` : '-'],
    ['Location', item.location || '-'],
    ['Purchase Date', item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '-'],
    ['Opened At', item.openedAt ? new Date(item.openedAt).toLocaleDateString() : '-'],
    ['Notes', item.notes || '-'],
  ]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="card p-5 w-full max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Item details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-2">
          {rows.map(([k,v]) => (
            <div key={k} className="flex items-start justify-between gap-4 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-right break-words">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="rounded-lg bg-gray-100 px-3 py-1">Close</button>
        </div>
      </div>
    </div>
  )
}
