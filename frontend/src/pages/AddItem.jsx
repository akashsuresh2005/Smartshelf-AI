// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import api from '../utils/api.js'
// import CategoryFilter from '../components/CategoryFilter.jsx'
// import BarcodeScanner from '../components/BarcodeScanner.jsx'

// export default function AddItem() {
//   const [name, setName] = useState('')
//   const [category, setCategory] = useState('groceries')
//   const [expiry, setExpiry] = useState('')
//   const [estimatedCost, setEstimatedCost] = useState('')
//   const [barcodeOpen, setBarcodeOpen] = useState(false)
//   const [message, setMessage] = useState('')

//   const onSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       await api.post('/api/items', { name, category, expiry, estimatedCost })
//       setMessage('Item added!')
//       setName('')
//       setEstimatedCost('')
//     } catch {
//       setMessage('Failed to add item')
//     }
//   }

//   return (
//     <div>
//       <h1 className="text-2xl font-semibold mb-4">Add Item</h1>

//       <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={onSubmit} className="card p-6 space-y-4">
//         {message && <p className="text-sm text-gray-600">{message}</p>}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Item name</label>
//             <input className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500" value={name} onChange={(e) => setName(e.target.value)} required />
//           </div>

//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Category</label>
//             <CategoryFilter value={category} onChange={setCategory} />
//           </div>

//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Expiry date</label>
//             <input type="date" className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
//           </div>

//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Estimated cost (₹)</label>
//             <input type="number" className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} placeholder="0.00" />
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <button type="submit" className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition">Save</button>
//           <button type="button" onClick={() => setBarcodeOpen(true)} className="rounded-lg bg-gray-100 text-gray-800 px-4 py-2 hover:bg-gray-200 transition">Scan barcode</button>
//         </div>
//       </motion.form>

//       {barcodeOpen && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
//           <div className="card p-4 w-full max-w-md">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-medium">Scan</h3>
//               <button className="text-gray-500" onClick={() => setBarcodeOpen(false)}>Close</button>
//             </div>
//             <BarcodeScanner onDetected={(code) => {
//               setName((prev) => prev || `Item ${code}`)
//               setBarcodeOpen(false)
//             }} />
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }







// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import api from '../utils/api.js';
// import CategoryFilter from '../components/CategoryFilter.jsx';
// import BarcodeScanner from '../components/BarcodeScanner.jsx';

// export default function AddItem() {
//   const [name, setName] = useState('');
//   // backend enum: ['grocery','medicine','cosmetic','beverage','other']
//   const [category, setCategory] = useState('grocery');
//   const [expiryDate, setExpiryDate] = useState(''); // <-- use expiryDate (backend expects this key)
//   const [estimatedCost, setEstimatedCost] = useState('');
//   const [barcodeOpen, setBarcodeOpen] = useState(false);
//   const [message, setMessage] = useState('');

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         name: String(name || '').trim(),
//         category: category || 'grocery',
//         expiryDate, // e.g. "2025-11-10"
//         estimatedCost: estimatedCost !== '' ? Number(estimatedCost) : undefined
//       };

//       // baseURL already has /api -> use "/items", not "/api/items"
//       await api.post('/items', payload);

//       setMessage('Item added!');
//       setName('');
//       setEstimatedCost('');
//       setExpiryDate('');
//     } catch (err) {
//       setMessage(err?.response?.data?.error || 'Failed to add item');
//     }
//   };

//   return (
//     <div>
//       <h1 className="text-2xl font-semibold mb-4">Add Item</h1>

//       <motion.form
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         onSubmit={onSubmit}
//         className="card p-6 space-y-4"
//       >
//         {message && <p className="text-sm text-gray-600">{message}</p>}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Item name</label>
//             <input
//               className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Category</label>
//             <CategoryFilter value={category} onChange={setCategory} />
//           </div>

//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Expiry date</label>
//             <input
//               type="date"
//               className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
//               value={expiryDate}
//               onChange={(e) => setExpiryDate(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Estimated cost (₹)</label>
//             <input
//               type="number"
//               className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
//               value={estimatedCost}
//               onChange={(e) => setEstimatedCost(e.target.value)}
//               placeholder="0.00"
//             />
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <button type="submit" className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition">
//             Save
//           </button>
//           <button
//             type="button"
//             onClick={() => setBarcodeOpen(true)}
//             className="rounded-lg bg-gray-100 text-gray-800 px-4 py-2 hover:bg-gray-200 transition"
//           >
//             Scan barcode
//           </button>
//         </div>
//       </motion.form>

//       {barcodeOpen && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
//           <div className="card p-4 w-full max-w-md">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-medium">Scan</h3>
//               <button className="text-gray-500" onClick={() => setBarcodeOpen(false)}>
//                 Close
//               </button>
//             </div>
//             <BarcodeScanner
//               onDetected={(code) => {
//                 setName((prev) => prev || `Item ${code}`);
//                 setBarcodeOpen(false);
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// src/pages/AddItem.jsx
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
  const [expiryDate, setExpiryDate] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [barcode, setBarcode] = useState('')
  const [brand, setBrand] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('pcs')
  const [location, setLocation] = useState('pantry')
  const [notes, setNotes] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [openedAt, setOpenedAt] = useState('')
  const [barcodeOpen, setBarcodeOpen] = useState(false)
  const [message, setMessage] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: name.trim(),
        category,
        expiryDate, // "YYYY-MM-DD"
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
      setMessage('Item added!')

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
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Failed to add item')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Add Item</h1>
      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={onSubmit} className="card p-6 space-y-4">
        {message && <p className="text-sm text-gray-600">{message}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Item name</label>
            <input className="w-full rounded-lg border-gray-200 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm mb-1">Category</label>
            <CategoryFilter value={category} onChange={setCategory} />
          </div>

          <div>
            <label className="block text-sm mb-1">Expiry date</label>
            <input type="date" className="w-full rounded-lg border-gray-200 px-3 py-2" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm mb-1">Estimated cost (₹)</label>
            <input type="number" className="w-full rounded-lg border-gray-200 px-3 py-2" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} placeholder="0.00" />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Barcode</label>
              <div className="flex gap-2">
                <input className="w-full rounded-lg border-gray-200 px-3 py-2" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scan or type" />
                <button type="button" onClick={() => setBarcodeOpen(true)} className="rounded-lg bg-gray-100 px-3 py-2">Scan</button>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Brand</label>
              <input className="w-full rounded-lg border-gray-200 px-3 py-2" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm mb-1">Quantity</label>
              <div className="flex gap-2">
                <input type="number" className="w-2/3 rounded-lg border-gray-200 px-3 py-2" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                <select className="w-1/3 rounded-lg border-gray-200 px-3 py-2" value={unit} onChange={(e) => setUnit(e.target.value)}>
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
          </div>

          <div>
            <label className="block text-sm mb-1">Location</label>
            <select className="w-full rounded-lg border-gray-200 px-3 py-2" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="pantry">Pantry</option>
              <option value="fridge">Fridge</option>
              <option value="freezer">Freezer</option>
              <option value="medicine-cabinet">Medicine cabinet</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Purchase date</label>
            <input type="date" className="w-full rounded-lg border-gray-200 px-3 py-2" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Opened at</label>
            <input type="date" className="w-full rounded-lg border-gray-200 px-3 py-2" value={openedAt} onChange={(e) => setOpenedAt(e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Notes</label>
            <textarea className="w-full rounded-lg border-gray-200 px-3 py-2" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Save</button>
          <button type="button" onClick={() => setBarcodeOpen(true)} className="rounded-lg bg-gray-100 text-gray-800 px-4 py-2 hover:bg-gray-200">Scan barcode</button>
        </div>
      </motion.form>

      {barcodeOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card p-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Scan barcode</h3>
              <button className="text-gray-500" onClick={() => setBarcodeOpen(false)}>Close</button>
            </div>
            <BarcodeScanner onDetected={(code) => { setBarcode(code); setBarcodeOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  )
}
