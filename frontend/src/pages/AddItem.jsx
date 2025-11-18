// src/pages/AddItem.jsx - Dark Theme with Logical Real-World Order
import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api.js'
import CategoryFilter from '../components/CategoryFilter.jsx'
import BarcodeScanner from '../components/BarcodeScanner.jsx'
import logActivity from '../utils/logActivity.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function AddItem() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('grocery')
  const [brand, setBrand] = useState('')
  const [barcode, setBarcode] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('pcs')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [openedAt, setOpenedAt] = useState('')
  const [location, setLocation] = useState('pantry')
  const [notes, setNotes] = useState('')
  const [barcodeOpen, setBarcodeOpen] = useState(false)
  const [message, setMessage] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: name.trim(),
        category,
        expiryDate,
        estimatedCost: estimatedCost !== '' ? Number(estimatedCost) : undefined,
        barcode: barcode?.trim() || undefined,
        brand: brand?.trim() || undefined,
        quantity: quantity !== '' ? Number(quantity) : undefined,
        unit,
        location,
        notes: notes?.trim() || undefined,
        purchaseDate: purchaseDate || undefined,
        openedAt: openedAt || undefined
      }

      const { data } = await api.post('/items', payload)
      setMessage('✓ Item added successfully!')

      // Log activity (best-effort)
      try {
        await logActivity({
          userId: user?.id,
          userName: user?.name || user?.email,
          type: 'item:add',
          message: `${user?.name || user?.email} added "${payload.name}"`,
          meta: { item: data }
        })
      } catch (e) {} // ignore

      // clear fields
      setName(''); setCategory('grocery'); setExpiryDate('')
      setEstimatedCost(''); setBarcode(''); setBrand('')
      setQuantity(''); setUnit('pcs'); setLocation('pantry')
      setNotes(''); setPurchaseDate(''); setOpenedAt('')
      
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('✕ ' + (err?.response?.data?.error || 'Failed to add item'))
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-cyan-400">Add Item</h1>
        <p className="text-base text-slate-500 mt-1">Add a new item to your inventory</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        onSubmit={onSubmit} 
        className="bg-slate-900/60 rounded-lg p-6 space-y-6 border border-slate-800/50"
      >
        {message && (
          <div className={`text-base px-4 py-3 rounded-lg border ${message.startsWith('✓') ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/60' : 'bg-rose-900/40 text-rose-300 border-rose-800/60'}`}>
            {message}
          </div>
        )}

        {/* Section 1: Basic Item Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Item name <span className="text-rose-400">*</span>
              </label>
              <input 
                className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g., Fresh Milk, Aspirin, Shampoo"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Category <span className="text-rose-400">*</span>
              </label>
              <CategoryFilter value={category} onChange={setCategory} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Brand</label>
              <input 
                className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Amul, Colgate" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Barcode / UPC</label>
              <div className="flex gap-2">
                <input 
                  className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
                  value={barcode} 
                  onChange={(e) => setBarcode(e.target.value)} 
                  placeholder="Scan or type manually" 
                />
                <button 
                  type="button" 
                  onClick={() => setBarcodeOpen(true)} 
                  className="rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 px-4 py-2.5 hover:bg-slate-700 transition-colors"
                  title="Scan barcode"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Quantity & Cost */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Quantity & Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Quantity</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  className="w-2/3 bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1" 
                />
                <select 
                  className="w-1/3 bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Estimated cost (₹)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
                value={estimatedCost} 
                onChange={(e) => setEstimatedCost(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
          </div>
        </div>

        {/* Section 3: Dates */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Important Dates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Purchase date
              </label>
              <input 
                type="date" 
                className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
                value={purchaseDate} 
                onChange={(e) => setPurchaseDate(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Expiry date <span className="text-rose-400">*</span>
              </label>
              <input 
                type="date" 
                className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
                value={expiryDate} 
                onChange={(e) => setExpiryDate(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Opened at
              </label>
              <input 
                type="date" 
                className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
                value={openedAt} 
                onChange={(e) => setOpenedAt(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Section 4: Storage & Notes */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Storage & Additional Notes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Storage location</label>
              <select 
                className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="pantry">Pantry</option>
                <option value="fridge">Fridge</option>
                <option value="freezer">Freezer</option>
                <option value="medicine-cabinet">Medicine cabinet</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-400 mb-2">Notes (optional)</label>
              <textarea 
                className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
                rows="1" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information..." 
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
          <button 
            type="submit" 
            className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold px-6 py-2.5 hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 text-base flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Item
          </button>
          <button 
            type="button" 
            onClick={() => {
              setName(''); setCategory('grocery'); setExpiryDate('')
              setEstimatedCost(''); setBarcode(''); setBrand('')
              setQuantity(''); setUnit('pcs'); setLocation('pantry')
              setNotes(''); setPurchaseDate(''); setOpenedAt('')
              setMessage('')
            }}
            className="rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 font-medium px-6 py-2.5 hover:bg-slate-700 transition-colors text-base flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Form
          </button>
        </div>
      </motion.form>

      {barcodeOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-slate-200">Scan Barcode</h3>
              <button 
                className="text-slate-400 hover:text-slate-200 transition-colors p-1" 
                onClick={() => setBarcodeOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <BarcodeScanner onDetected={(code) => { setBarcode(code); setBarcodeOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  )
}