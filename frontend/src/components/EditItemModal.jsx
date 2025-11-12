// import { useState } from 'react'
// import api from '../utils/api.js'
// import CategoryFilter from './CategoryFilter.jsx'

// export default function EditItemModal({ item, onSaved, onClose }) {
//   const [form, setForm] = useState({
//     name: item?.name || '',
//     category: item?.category || 'grocery',
//     expiryDate: item?.expiryDate ? item.expiryDate.slice(0,10) : '',
//     estimatedCost: item?.estimatedCost ?? '',
//     barcode: item?.barcode || '',
//     brand: item?.brand || '',
//     quantity: item?.quantity ?? '',
//     unit: item?.unit || 'pcs',
//     location: item?.location || 'pantry',
//     notes: item?.notes || '',
//     purchaseDate: item?.purchaseDate ? item.purchaseDate.slice(0,10) : '',
//     openedAt: item?.openedAt ? item.openedAt.slice(0,10) : '',
//   })

//   const set = (k,v)=>setForm(f=>({ ...f, [k]: v }))

//   const save = async (e) => {
//     e.preventDefault()
//     const payload = {
//       ...form,
//       estimatedCost: form.estimatedCost === '' ? undefined : Number(form.estimatedCost),
//       quantity: form.quantity === '' ? undefined : Number(form.quantity),
//       expiryDate: form.expiryDate || undefined,
//       purchaseDate: form.purchaseDate || undefined,
//       openedAt: form.openedAt || undefined,
//     }
//     await api.put(`/items/${item._id}`, payload)
//     onSaved?.()
//     onClose?.()
//   }

//   if (!item) return null

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
//       <form onSubmit={save} className="card p-5 w-full max-w-2xl space-y-3">
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold">Edit item</h3>
//           <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <div>
//             <label className="block text-sm mb-1">Name</label>
//             <input className="w-full rounded-lg border-gray-200" value={form.name} onChange={(e)=>set('name', e.target.value)} required />
//           </div>
//           <div>
//             <label className="block text-sm mb-1">Category</label>
//             <CategoryFilter value={form.category} onChange={(v)=>set('category', v)} />
//           </div>
//           <div>
//             <label className="block text-sm mb-1">Expiry date</label>
//             <input type="date" className="w-full rounded-lg border-gray-200" value={form.expiryDate} onChange={(e)=>set('expiryDate', e.target.value)} required />
//           </div>
//           <div>
//             <label className="block text-sm mb-1">Estimated cost (₹)</label>
//             <input type="number" className="w-full rounded-lg border-gray-200" value={form.estimatedCost} onChange={(e)=>set('estimatedCost', e.target.value)} />
//           </div>
//           <div>
//             <label className="block text-sm mb-1">Barcode</label>
//             <input className="w-full rounded-lg border-gray-200" value={form.barcode} onChange={(e)=>set('barcode', e.target.value)} />
//           </div>
//           <div>
//             <label className="block text-sm mb-1">Brand</label>
//             <input className="w-full rounded-lg border-gray-200" value={form.brand} onChange={(e)=>set('brand', e.target.value)} />
//           </div>
//           <div className="flex gap-2">
//             <div className="w-2/3">
//               <label className="block text-sm mb-1">Quantity</label>
//               <input type="number" className="w-full rounded-lg border-gray-200" value={form.quantity} onChange={(e)=>set('quantity', e.target.value)} />
//             </div>
//             <div className="w-1/3">
//               <label className="block text-sm mb-1">Unit</label>
//               <select className="w-full rounded-lg border-gray-200" value={form.unit} onChange={(e)=>set('unit', e.target.value)}>
//                 <option value="pcs">pcs</option><option value="g">g</option><option value="kg">kg</option>
//                 <option value="ml">ml</option><option value="l">l</option><option value="tablet">tablet</option>
//                 <option value="capsule">capsule</option><option value="pack">pack</option><option value="other">other</option>
//               </select>
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm mb-1">Location</label>
//             <select className="w-full rounded-lg border-gray-200" value={form.location} onChange={(e)=>set('location', e.target.value)}>
//               <option value="pantry">Pantry</option><option value="fridge">Fridge</option><option value="freezer">Freezer</option>
//               <option value="medicine-cabinet">Medicine cabinet</option><option value="other">Other</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm mb-1">Purchase date</label>
//             <input type="date" className="w-full rounded-lg border-gray-200" value={form.purchaseDate} onChange={(e)=>set('purchaseDate', e.target.value)} />
//           </div>
//           <div>
//             <label className="block text-sm mb-1">Opened at</label>
//             <input type="date" className="w-full rounded-lg border-gray-200" value={form.openedAt} onChange={(e)=>set('openedAt', e.target.value)} />
//           </div>
//           <div className="md:col-span-2">
//             <label className="block text-sm mb-1">Notes</label>
//             <textarea rows="2" className="w-full rounded-lg border-gray-200" value={form.notes} onChange={(e)=>set('notes', e.target.value)} />
//           </div>
//         </div>

//         <div className="flex items-center justify-end gap-2 pt-1">
//           <button type="button" className="rounded-lg bg-gray-100 px-3 py-2" onClick={onClose}>Cancel</button>
//           <button type="submit" className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Save</button>
//         </div>
//       </form>
//     </div>
//   )
// }
import { useState } from 'react'
import api from '../utils/api.js'
import CategoryFilter from './CategoryFilter.jsx'

export default function EditItemModal({ item, onSaved, onClose }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    category: item?.category || 'grocery',
    expiryDate: item?.expiryDate ? String(item.expiryDate).slice(0,10) : '',
    estimatedCost: item?.estimatedCost ?? '',
    barcode: item?.barcode || '',
    brand: item?.brand || '',
    quantity: item?.quantity ?? '',
    unit: item?.unit || 'pcs',
    location: item?.location || 'pantry',
    notes: item?.notes || '',
    purchaseDate: item?.purchaseDate ? String(item.purchaseDate).slice(0,10) : '',
    openedAt: item?.openedAt ? String(item.openedAt).slice(0,10) : '',
  })

  const set = (k,v)=>setForm(f=>({ ...f, [k]: v }))

  const save = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      estimatedCost: form.estimatedCost === '' ? undefined : Number(form.estimatedCost),
      quantity: form.quantity === '' ? undefined : Number(form.quantity),
      expiryDate: form.expiryDate || undefined,
      purchaseDate: form.purchaseDate || undefined,
      openedAt: form.openedAt || undefined,
    }
    await api.put(`/items/${item._id}`, payload)
    onSaved?.()
    onClose?.()
  }

  if (!item) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <form onSubmit={save} className="card p-5 w-full max-w-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Edit item</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full rounded-lg border-gray-200" value={form.name} onChange={(e)=>set('name', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Category</label>
            <CategoryFilter value={form.category} onChange={(v)=>set('category', v)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Expiry date</label>
            <input type="date" className="w-full rounded-lg border-gray-200" value={form.expiryDate} onChange={(e)=>set('expiryDate', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Estimated cost (₹)</label>
            <input type="number" className="w-full rounded-lg border-gray-200" value={form.estimatedCost} onChange={(e)=>set('estimatedCost', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Barcode</label>
            <input className="w-full rounded-lg border-gray-200" value={form.barcode} onChange={(e)=>set('barcode', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Brand</label>
            <input className="w-full rounded-lg border-gray-200" value={form.brand} onChange={(e)=>set('brand', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="w-2/3">
              <label className="block text-sm mb-1">Quantity</label>
              <input type="number" className="w-full rounded-lg border-gray-200" value={form.quantity} onChange={(e)=>set('quantity', e.target.value)} />
            </div>
            <div className="w-1/3">
              <label className="block text-sm mb-1">Unit</label>
              <select className="w-full rounded-lg border-gray-200" value={form.unit} onChange={(e)=>set('unit', e.target.value)}>
                <option value="pcs">pcs</option><option value="g">g</option><option value="kg">kg</option>
                <option value="ml">ml</option><option value="l">l</option><option value="tablet">tablet</option>
                <option value="capsule">capsule</option><option value="pack">pack</option><option value="other">other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Location</label>
            <select className="w-full rounded-lg border-gray-200" value={form.location} onChange={(e)=>set('location', e.target.value)}>
              <option value="pantry">Pantry</option><option value="fridge">Fridge</option><option value="freezer">Freezer</option>
              <option value="medicine-cabinet">Medicine cabinet</option><option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Purchase date</label>
            <input type="date" className="w-full rounded-lg border-gray-200" value={form.purchaseDate} onChange={(e)=>set('purchaseDate', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Opened at</label>
            <input type="date" className="w-full rounded-lg border-gray-200" value={form.openedAt} onChange={(e)=>set('openedAt', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Notes</label>
            <textarea rows="2" className="w-full rounded-lg border-gray-200" value={form.notes} onChange={(e)=>set('notes', e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button type="button" className="rounded-lg bg-gray-100 px-3 py-2" onClick={onClose}>Cancel</button>
          <button type="submit" className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Save</button>
        </div>
      </form>
    </div>
  )
}
