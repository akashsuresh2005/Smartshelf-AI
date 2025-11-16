
// src/components/EditItemModal.jsx
import { useState } from 'react'
import api from '../utils/api.js'
import CategoryFilter from './CategoryFilter.jsx'

export default function EditItemModal({ item, onSaved, onClose }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    category: item?.category || 'grocery',
    expiryDate: item?.expiryDate ? String(item.expiryDate).slice(0, 10) : '',
    estimatedCost: item?.estimatedCost ?? '',
    barcode: item?.barcode || '',
    brand: item?.brand || '',
    quantity: item?.quantity ?? '',
    unit: item?.unit || 'pcs',
    location: item?.location || 'pantry',
    notes: item?.notes || '',
    purchaseDate: item?.purchaseDate ? String(item.purchaseDate).slice(0, 10) : '',
    openedAt: item?.openedAt ? String(item.openedAt).slice(0, 10) : '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form
        onSubmit={save}
        className="w-full max-w-2xl bg-slate-900/70 rounded-xl border border-slate-800/50 shadow-lg p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-cyan-400">Edit item</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close edit item modal"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <input
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Category</label>
            <CategoryFilter
              value={form.category}
              onChange={(v) => set('category', v)}
            />
          </div>

          {/* Expiry date */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Expiry date</label>
            <input
              type="date"
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
              value={form.expiryDate}
              onChange={(e) => set('expiryDate', e.target.value)}
              required
            />
          </div>

          {/* Estimated cost */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Estimated cost (₹)</label>
            <input
              type="number"
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
              value={form.estimatedCost}
              onChange={(e) => set('estimatedCost', e.target.value)}
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Barcode</label>
            <input
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
              value={form.barcode}
              onChange={(e) => set('barcode', e.target.value)}
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Brand</label>
            <input
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
            />
          </div>

          {/* Quantity + Unit */}
          <div className="flex gap-3">
            <div className="w-2/3">
              <label className="block text-sm text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm text-slate-400 mb-1">Unit</label>
              <select
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
                value={form.unit}
                onChange={(e) => set('unit', e.target.value)}
              >
                <option value="pcs">pcs</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="tablet">tablet</option>
                <option value="capsule">capsule</option>
                <option value="pack">pack</option>
                <option value="other">other</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Location</label>
            <select
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
            >
              <option value="pantry">Pantry</option>
              <option value="fridge">Fridge</option>
              <option value="freezer">Freezer</option>
              <option value="medicine-cabinet">Medicine cabinet</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Purchase date */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Purchase date</label>
            <input
              type="date"
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
              value={form.purchaseDate}
              onChange={(e) => set('purchaseDate', e.target.value)}
            />
          </div>

          {/* Opened at */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Opened at</label>
            <input
              type="date"
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
              value={form.openedAt}
              onChange={(e) => set('openedAt', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">Notes</label>
            <textarea
              rows="2"
              className="w-full rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            className="rounded-lg border border-slate-700/50 bg-slate-800/60 text-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-700/60 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}