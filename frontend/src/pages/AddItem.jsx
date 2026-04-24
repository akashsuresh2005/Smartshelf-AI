// // src/pages/AddItem.jsx - Dark Theme with Logical Real-World Order
// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import api from '../utils/api.js'
// import CategoryFilter from '../components/CategoryFilter.jsx'
// import BarcodeScanner from '../components/BarcodeScanner.jsx'
// import logActivity from '../utils/logActivity.js'
// import { useAuth } from '../context/AuthContext.jsx'

// export default function AddItem() {
//   const { user } = useAuth()
//   const [name, setName] = useState('')
//   const [category, setCategory] = useState('grocery')
//   const [brand, setBrand] = useState('')
//   const [barcode, setBarcode] = useState('')
//   const [quantity, setQuantity] = useState('')
//   const [unit, setUnit] = useState('pcs')
//   const [estimatedCost, setEstimatedCost] = useState('')
//   const [purchaseDate, setPurchaseDate] = useState('')
//   const [expiryDate, setExpiryDate] = useState('')
//   const [openedAt, setOpenedAt] = useState('')
//   const [location, setLocation] = useState('pantry')
//   const [notes, setNotes] = useState('')
//   const [barcodeOpen, setBarcodeOpen] = useState(false)
//   const [message, setMessage] = useState('')

//   // ✅ NEW STATE
//   const [whatsappNumber, setWhatsappNumber] = useState('')


  

//   const onSubmit = async (e) => {
//      console.log("FORM SUBMITTED")
//     e.preventDefault()
//     try {

//       console.log("WhatsApp:", whatsappNumber)

//       if (!/^\+91\d{10}$/.test(whatsappNumber)) {
//       setMessage('✕ Enter valid WhatsApp number')
//       setLoading(false)
//       return
//     }
//       const payload = {
//         name: name.trim(),
//         category,
//         expiryDate,
//         estimatedCost: estimatedCost !== '' ? Number(estimatedCost) : undefined,
//         barcode: barcode?.trim() || undefined,
//         brand: brand?.trim() || undefined,
//         quantity: quantity !== '' ? Number(quantity) : undefined,
//         unit,
//         location,
//         notes: notes?.trim() || undefined,
//         purchaseDate: purchaseDate || undefined,
//         openedAt: openedAt || undefined,

//         // ✅ NEW FIELD
//         whatsappNumber: whatsappNumber?.trim() || undefined
//       }

//       const { data } = await api.post('/items', payload)
//       setMessage('✓ Item added successfully!')

//       // Log activity (best-effort)
//       try {
//         await logActivity({
//           userId: user?.id,
//           userName: user?.name || user?.email,
//           type: 'item:add',
//           message: `${user?.name || user?.email} added "${payload.name}"`,
//           meta: { item: data }
//         })
//       } catch (e) {} // ignore

//       // clear fields
//       setName(''); setCategory('grocery'); setExpiryDate('')
//       setEstimatedCost(''); setBarcode(''); setBrand('')
//       setQuantity(''); setUnit('pcs'); setLocation('pantry')
//       setNotes(''); setPurchaseDate(''); setOpenedAt('')
//       setWhatsappNumber('') // ✅ NEW
      
//       setTimeout(() => setMessage(''), 3000)
//     } catch (err) {
//       setMessage('✕ ' + (err?.response?.data?.error || 'Failed to add item'))
//     }
//   }

//   return (
//     <div>
//       <div className="mb-4 sm:mb-6">
//         <h1 className="text-2xl sm:text-3xl font-semibold text-cyan-400">Add Item</h1>
//         <p className="text-sm sm:text-base text-slate-500 mt-1">Add a new item to your inventory</p>
//       </div>

//       <motion.form 
//         initial={{ opacity: 0, y: 10 }} 
//         animate={{ opacity: 1, y: 0 }} 
//         onSubmit={onSubmit} 
//         className="bg-slate-900/60 rounded-lg p-4 sm:p-6 space-y-5 sm:space-y-6 border border-slate-800/50"
//       >
//         {message && (
//           <div className={`text-sm sm:text-base px-4 py-3 rounded-lg border ${message.startsWith('✓') ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/60' : 'bg-rose-900/40 text-rose-300 border-rose-800/60'}`}>
//             {message}
//           </div>
//         )}

//         {/* Section 1: Basic Item Information */}
//         <div className="space-y-3 sm:space-y-4">
//           <h2 className="text-base sm:text-lg font-semibold text-slate-300 flex items-center gap-2">
//             <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             Basic Information
//           </h2>
          
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">
//                 Item name <span className="text-rose-400">*</span>
//               </label>
//               <input 
//                 className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
//                 value={name} 
//                 onChange={(e) => setName(e.target.value)} 
//                 placeholder="e.g., Fresh Milk, Aspirin, Shampoo"
//                 required 
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">
//                 Category <span className="text-rose-400">*</span>
//               </label>
//               <CategoryFilter value={category} onChange={setCategory} />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">Brand</label>
//               <input 
//                 className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
//                 value={brand} 
//                 onChange={(e) => setBrand(e.target.value)}
//                 placeholder="e.g., Amul, Colgate" 
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">Barcode / UPC</label>
//               <div className="flex gap-2">
//                 <input 
//                   className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
//                   value={barcode} 
//                   onChange={(e) => setBarcode(e.target.value)} 
//                   placeholder="Scan or type manually" 
//                 />
//                 <button 
//                   type="button" 
//                   onClick={() => setBarcodeOpen(true)} 
//                   className="rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 px-3 sm:px-4 py-2.5 hover:bg-slate-700 transition-colors flex-shrink-0"
//                   title="Scan barcode"
//                 >
//                   <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Section 2: Quantity & Cost */}
//         <div className="space-y-3 sm:space-y-4">
//           <h2 className="text-base sm:text-lg font-semibold text-slate-300 flex items-center gap-2">
//             <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//             </svg>
//             Quantity &amp; Pricing
//           </h2>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">Quantity</label>
//               <div className="flex gap-2">
//                 <input 
//                   type="number" 
//                   className="w-2/3 bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
//                   value={quantity} 
//                   onChange={(e) => setQuantity(e.target.value)}
//                   placeholder="1" 
//                 />
//                 <select 
//                   className="w-1/3 bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-2 sm:px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
//                   value={unit} 
//                   onChange={(e) => setUnit(e.target.value)}
//                 >
//                   <option value="pcs">pcs</option>
//                   <option value="g">g</option>
//                   <option value="kg">kg</option>
//                   <option value="ml">ml</option>
//                   <option value="l">l</option>
//                   <option value="tablet">tablet</option>
//                   <option value="capsule">capsule</option>
//                   <option value="pack">pack</option>
//                   <option value="other">other</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">Estimated cost (₹)</label>
//               <input 
//                 type="number" 
//                 step="0.01"
//                 className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
//                 value={estimatedCost} 
//                 onChange={(e) => setEstimatedCost(e.target.value)} 
//                 placeholder="0.00" 
//               />
//             </div>
//           </div>
//         </div>

//         {/* Section 3: Dates */}
//         <div className="space-y-3 sm:space-y-4">
//           <h2 className="text-base sm:text-lg font-semibold text-slate-300 flex items-center gap-2">
//             <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//             Important Dates
//           </h2>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">
//                 Purchase date
//               </label>
//               <input 
//                 type="date" 
//                 className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
//                 value={purchaseDate} 
//                 onChange={(e) => setPurchaseDate(e.target.value)} 
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">
//                 Expiry date <span className="text-rose-400">*</span>
//               </label>
//               <input 
//                 type="date" 
//                 className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
//                 value={expiryDate} 
//                 onChange={(e) => setExpiryDate(e.target.value)} 
//                 required 
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">
//                 Opened at
//               </label>
//               <input 
//                 type="date" 
//                 className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
//                 value={openedAt} 
//                 onChange={(e) => setOpenedAt(e.target.value)} 
//               />
//             </div>
//           </div>
//         </div>

//         {/* Section 4: Storage & Notes */}
//         <div className="space-y-3 sm:space-y-4">
//           <h2 className="text-base sm:text-lg font-semibold text-slate-300 flex items-center gap-2">
//             <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//             </svg>
//             Storage &amp; Additional Notes
//           </h2>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">Storage location</label>
//               <select 
//                 className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors" 
//                 value={location} 
//                 onChange={(e) => setLocation(e.target.value)}
//               >
//                 <option value="pantry">Pantry</option>
//                 <option value="fridge">Fridge</option>
//                 <option value="freezer">Freezer</option>
//                 <option value="medicine-cabinet">Medicine cabinet</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>

//             <div className="sm:col-span-1">
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">Notes (optional)</label>
//               <textarea 
//                 className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600" 
//                 rows="1" 
//                 value={notes} 
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Any additional information..." 
//               />
//             </div>

//             {/* ✅ NEW FIELD ADDED */}
//             <div>
//               <label className="block text-sm font-medium text-slate-400 mb-1 sm:mb-2">
//                 WhatsApp Number
//               </label>
//               <input
//                 type="text"
//                 className="w-full bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
//                 value={whatsappNumber}
//                 onChange={(e) => {
//   const digits = e.target.value.replace(/\D/g, '').slice(-10)
//   setWhatsappNumber(digits ? `+91${digits}` : '')
// }}
//                 placeholder="+91XXXXXXXXXX"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-800/50">
//           <button 
//             type="submit" 
//             className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold px-5 sm:px-6 py-2.5 hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 text-sm sm:text-base flex items-center gap-2"
//           >
//             <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//             </svg>
//             Save Item
//           </button>
//           <button 
//             type="button" 
//             onClick={() => {
//               setName(''); setCategory('grocery'); setExpiryDate('')
//               setEstimatedCost(''); setBarcode(''); setBrand('')
//               setQuantity(''); setUnit('pcs'); setLocation('pantry')
//               setNotes(''); setPurchaseDate(''); setOpenedAt('')
//               setWhatsappNumber('') // ✅ NEW
//               setMessage('')
//             }}
//             className="rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 font-medium px-5 sm:px-6 py-2.5 hover:bg-slate-700 transition-colors text-sm sm:text-base flex items-center gap-2"
//           >
//             <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//             </svg>
//             Reset Form
//           </button>
//         </div>
//       </motion.form>

//       {barcodeOpen && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
//           <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
//             <div className="flex items-center justify-between mb-3 sm:mb-4">
//               <h3 className="font-semibold text-base sm:text-lg text-slate-200">Scan Barcode</h3>
//               <button 
//                 className="text-slate-400 hover:text-slate-200 transition-colors p-1" 
//                 onClick={() => setBarcodeOpen(false)}
//               >
//                 <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//             <BarcodeScanner onDetected={(code) => { setBarcode(code); setBarcodeOpen(false); }} />
//           </div>
//         </div>
//       )}
//     </div>
//   )
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
  
  // Form States
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
  const [whatsappNumber, setWhatsappNumber] = useState('')
  
  // UI States
  const [barcodeOpen, setBarcodeOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  /**
   * ✅ SMART FEATURE: Auto-fill product info from barcode
   * Hits the OpenFoodFacts API to fetch real-world data
   */
  const handleBarcodeDetected = async (code) => {
    setBarcode(code);
    setBarcodeOpen(false); // Close scanner immediately for better UX
    setIsScanning(true);
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await response.json();

      if (data.status === 1) {
        // Successfully found the product
        setName(data.product.product_name || '');
        setBrand(data.product.brands || '');
        setMessage('✓ Product details auto-filled!');
      } else {
        setMessage('Barcode scanned, but product not found in database.');
      }
    } catch (err) {
      console.error("Product lookup failed", err);
      setMessage('✕ Could not reach product database.');
    } finally {
      setIsScanning(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      // Validation for WhatsApp Number
      if (whatsappNumber && !/^\+91\d{10}$/.test(whatsappNumber)) {
        setMessage('✕ Enter valid WhatsApp number (+91 followed by 10 digits)')
        return
      }

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
        openedAt: openedAt || undefined,
        whatsappNumber: whatsappNumber?.trim() || undefined
      }

      const { data } = await api.post('/items', payload)
      setMessage('✓ Item added successfully!')

      // Log activity
      try {
        await logActivity({
          userId: user?.id,
          userName: user?.name || user?.email,
          type: 'item:add',
          message: `${user?.name || user?.email} added "${payload.name}"`,
          meta: { item: data }
        })
      } catch (e) { /* silent log fail */ }

      // Reset all fields
      handleReset();
      
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('✕ ' + (err?.response?.data?.error || 'Failed to add item'))
    }
  }

  const handleReset = () => {
    setName(''); setCategory('grocery'); setExpiryDate(''); setEstimatedCost('');
    setBarcode(''); setBrand(''); setQuantity(''); setUnit('pcs'); 
    setLocation('pantry'); setNotes(''); setPurchaseDate(''); setOpenedAt('');
    setWhatsappNumber('');
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">Add New Item</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          {isScanning ? (
            <span className="flex items-center gap-2 text-cyan-500 animate-pulse">
              <svg className="animate-spin h-4 w-4 text-cyan-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Fetching product details...
            </span>
          ) : "Keep track of your supplies and their expiry dates"}
        </p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        onSubmit={onSubmit} 
        className="bg-slate-900/60 rounded-xl p-5 sm:p-8 space-y-6 sm:space-y-8 border border-slate-800/50 shadow-xl"
      >
        {message && (
          <div className={`text-sm sm:text-base px-4 py-3 rounded-lg border flex items-center gap-2 ${message.startsWith('✓') ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/60' : 'bg-rose-900/40 text-rose-300 border-rose-800/60'}`}>
            <span>{message}</span>
          </div>
        )}

        {/* Section 1: Identity */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Item Name *</label>
              <input 
                className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600" 
                value={name} onChange={(e) => setName(e.target.value)} required 
                placeholder="e.g. Greek Yogurt"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Category *</label>
              <CategoryFilter value={category} onChange={setCategory} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Brand</label>
              <input 
                className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600" 
                value={brand} onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Epigamia" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Barcode / UPC</label>
              <div className="flex gap-2">
                <input 
                  className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600" 
                  value={barcode} onChange={(e) => setBarcode(e.target.value)} 
                  placeholder="Scan or type code" 
                />
                <button 
                  type="button" 
                  onClick={() => setBarcodeOpen(true)} 
                  className="rounded-lg bg-slate-700/60 border border-slate-600/50 text-slate-300 px-4 py-2.5 hover:bg-slate-700 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Numbers */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Quantity & Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Stock Quantity</label>
              <div className="flex gap-2">
                <input type="number" className="w-2/3 bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 focus:border-cyan-500/50 outline-none transition-all" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" />
                <select className="w-1/3 bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-lg px-2 focus:border-cyan-500/50 outline-none" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                  <option value="tablet">tablet</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Estimated cost (₹)</label>
              <input type="number" step="0.01" className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 focus:border-cyan-500/50 outline-none transition-all" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} placeholder="0.00" />
            </div>
          </div>
        </div>

        {/* Section 3: Time & Place */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Inventory Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="block text-xs text-slate-500 uppercase tracking-wider">Purchase Date</label>
              <input type="date" className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2 focus:border-cyan-500/50 outline-none" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-cyan-500 uppercase tracking-wider font-semibold">Expiry Date *</label>
              <input type="date" className="w-full bg-slate-800/40 border border-cyan-500/20 text-slate-200 rounded-lg px-4 py-2 focus:border-cyan-500/50 outline-none" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-slate-500 uppercase tracking-wider">Opened At</label>
              <input type="date" className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2 focus:border-cyan-500/50 outline-none" value={openedAt} onChange={(e) => setOpenedAt(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">Storage Location</label>
              <select className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-cyan-500/50" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="pantry">Pantry</option>
                <option value="fridge">Fridge</option>
                <option value="freezer">Freezer</option>
                <option value="medicine-cabinet">Medicine Cabinet</option>
                <option value="shelf">Room Shelf</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">WhatsApp Alert Number</label>
              <input 
                type="text" className="w-full bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600" 
                value={whatsappNumber} onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(-10); setWhatsappNumber(digits ? `+91${digits}` : '') }}
                placeholder="+91 XXXXXXXXXX"
              />
              <p className="text-[10px] text-slate-500 italic px-1">We'll notify this number when item is near expiry.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-800">
          <button 
            type="submit" 
            disabled={isScanning}
            className={`rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold px-10 py-3.5 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-900/20 active:scale-95 flex items-center gap-2 ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save to Inventory
          </button>
          
          <button 
            type="button" 
            onClick={handleReset} 
            className="rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 px-8 py-3.5 hover:bg-slate-700 hover:text-slate-200 transition-colors"
          >
            Reset Form
          </button>
        </div>
      </motion.form>

      {/* Barcode Scanner Overlay */}
      {barcodeOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-xl text-white">Scan Barcode</h3>
                <p className="text-xs text-slate-500">Align barcode within the window</p>
              </div>
              <button 
                className="text-slate-500 hover:text-rose-400 transition-colors bg-slate-800 p-2 rounded-full" 
                onClick={() => setBarcodeOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-slate-700 bg-black">
              <BarcodeScanner onDetected={handleBarcodeDetected} />
            </div>
            
            <div className="mt-4 flex justify-center">
               <button 
                 onClick={() => setBarcodeOpen(false)}
                 className="text-sm text-slate-400 underline"
               >
                 Cancel and enter manually
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}