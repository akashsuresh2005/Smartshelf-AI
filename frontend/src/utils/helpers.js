// import { v4 as uuidv4 } from 'uuid'

// export const daysUntil = (dateStr) => {
//   const today = new Date()
//   const target = new Date(dateStr)
//   const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
//   return diff
// }

// export const expiryBadge = (dateStr) => {
//   const d = daysUntil(dateStr)
//   if (d < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700' }
//   if (d <= 3) return { label: `Expiring in ${d}d`, color: 'bg-orange-100 text-orange-700' }
//   if (d <= 7) return { label: `Soon (${d}d)`, color: 'bg-yellow-100 text-yellow-700' }
//   return { label: `Fresh (${d}d)`, color: 'bg-green-100 text-green-700' }
// }

// /* Gamification: award badges when consumed before expiry */
// export const evaluateBadges = (items) => {
//   const badges = []
//   const now = new Date()
//   const consumedEarly = items.filter((i) => i.consumedAt && new Date(i.consumedAt) < new Date(i.expiry))
//   if (consumedEarly.length >= 1) {
//     badges.push({ id: uuidv4(), name: 'Fresh Saver', description: 'Consumed before expiry', date: now.toISOString() })
//   }
//   if (consumedEarly.length >= 10) {
//     badges.push({ id: uuidv4(), name: 'Expiry Ninja', description: '10+ items before expiry', date: now.toISOString() })
//   }
//   return badges
// }

// /* Money Saved: sum of estimated costs for items consumed before expiry */
// export const moneySaved = (items) => {
//   return items
//     .filter((i) => i.consumedAt && new Date(i.consumedAt) < new Date(i.expiry))
//     .reduce((sum, i) => sum + (Number(i.estimatedCost) || 0), 0)
// }
// src/utils/helpers.js
// src/utils/helpers.js
// import { v4 as uuidv4 } from 'uuid'

// export const daysUntil = (dateStr) => {
//   const today = new Date()
//   const target = new Date(dateStr)
//   const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
//   return diff
// }

// export const expiryBadge = (dateStr) => {
//   const d = daysUntil(dateStr)
//   if (d < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700' }
//   if (d <= 3) return { label: `Expiring in ${d}d`, color: 'bg-orange-100 text-orange-700' }
//   if (d <= 7) return { label: `Soon (${d}d)`, color: 'bg-yellow-100 text-yellow-700' }
//   return { label: `Fresh (${d}d)`, color: 'bg-green-100 text-green-700' }
// }

// /* Gamification: award badges when consumed before expiry */
// export const evaluateBadges = (items = []) => {
//   const badges = []
//   const now = new Date()
//   // use expiryDate (not 'expiry')
//   const consumedEarly = (items || []).filter(
//     (i) => i?.consumedAt && i?.expiryDate && new Date(i.consumedAt) < new Date(i.expiryDate)
//   )
//   if (consumedEarly.length >= 1) {
//     badges.push({
//       id: uuidv4(),
//       name: 'Fresh Saver',
//       description: 'Consumed before expiry',
//       date: now.toISOString()
//     })
//   }
//   if (consumedEarly.length >= 10) {
//     badges.push({
//       id: uuidv4(),
//       name: 'Expiry Ninja',
//       description: '10+ items consumed before expiry',
//       date: now.toISOString()
//     })
//   }
//   return badges
// }

// /* Money Saved: sum of estimated costs for items consumed before expiry */
// export const moneySaved = (items = []) => {
//   return (items || [])
//     .filter((i) => i?.consumedAt && i?.expiryDate && new Date(i.consumedAt) < new Date(i.expiryDate))
//     .reduce((sum, i) => sum + (Number(i.estimatedCost) || 0), 0)
// }

// /**
//  * mostUsedLocation(items)
//  * Returns the most frequent non-empty location (capitalized) or '—' when none.
//  */
// export const mostUsedLocation = (items = []) => {
//   if (!Array.isArray(items) || items.length === 0) return '—'
//   const counts = {}
//   for (const it of items) {
//     const loc = (it?.location || '').toString().trim()
//     if (!loc) continue
//     counts[loc] = (counts[loc] || 0) + 1
//   }
//   const entries = Object.entries(counts)
//   if (!entries.length) return '—'
//   entries.sort((a, b) => b[1] - a[1])
//   const top = entries[0][0]
//   return top.charAt(0).toUpperCase() + top.slice(1)
// }

// /**
//  * stockValueEstimation(items)
//  * Returns numeric sum of (quantity * estimatedCost).
//  * Rules:
//  *  - If estimatedCost is missing -> item ignored
//  *  - If quantity missing -> treated as 1
//  *  - Quantity coerced to Number (fallback to 1 on NaN)
//  */
// export const stockValueEstimation = (items = []) => {
//   if (!Array.isArray(items)) return 0
//   let total = 0
//   for (const it of items) {
//     const cost = (it && typeof it.estimatedCost === 'number') ? it.estimatedCost : null
//     if (cost === null) continue
//     let qty = 1
//     if (it?.quantity !== undefined && it?.quantity !== null && it?.quantity !== '') {
//       const n = Number(it.quantity)
//       qty = Number.isNaN(n) ? 1 : n
//     }
//     total += qty * cost
//   }
//   return total
// }// src/utils/helpers.js
// src/utils/helpers.js
import { v4 as uuidv4 } from 'uuid'

const safeDate = (v) => {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

const parseCost = (v) => {
  if (v === undefined || v === null) return null
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    // strip non-digit / non-dot characters (e.g. "₹35", "35.00")
    const cleaned = v.replace(/[^\d.-]+/g, '')
    const n = Number(cleaned)
    return Number.isNaN(n) ? null : n
  }
  return null
}

export const daysUntil = (dateStr) => {
  const today = new Date()
  const target = safeDate(dateStr)
  if (!target) return null
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  return diff
}

export const expiryBadge = (dateStr) => {
  const d = daysUntil(dateStr)
  if (d === null) return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' }
  if (d < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700' }
  if (d <= 3) return { label: `Expiring in ${d}d`, color: 'bg-orange-100 text-orange-700' }
  if (d <= 7) return { label: `Soon (${d}d)`, color: 'bg-yellow-100 text-yellow-700' }
  return { label: `Fresh (${d}d)`, color: 'bg-green-100 text-green-700' }
}

/* Gamification: award badges when consumed before expiry
   More permissive rules:
   - If consumedAt missing but status==='consumed', fall back to updatedAt (if available)
*/
export const evaluateBadges = (items = []) => {
  const badges = []
  const now = new Date()

  const consumedEarly = (items || []).filter((i) => {
    if (!i) return false
    const exp = safeDate(i.expiryDate)
    // prefer consumedAt, fallback to updatedAt when consumedAt missing and status is consumed
    const consumed = safeDate(i.consumedAt) || (i.status === 'consumed' ? safeDate(i.updatedAt) : null)
    if (!consumed || !exp) return false
    return consumed < exp
  })

  if (consumedEarly.length >= 1) {
    badges.push({
      id: uuidv4(),
      name: 'Fresh Saver',
      description: 'Consumed before expiry',
      date: now.toISOString()
    })
  }
  if (consumedEarly.length >= 10) {
    badges.push({
      id: uuidv4(),
      name: 'Expiry Ninja',
      description: '10+ items consumed before expiry',
      date: now.toISOString()
    })
  }

  return badges
}

/* Money Saved: sum of estimated costs for items consumed before expiry
   More permissive: parse string costs and consider consumed items with fallback consumedAt
*/
export const moneySaved = (items = []) => {
  return (items || [])
    .map(i => {
      if (!i) return null
      const exp = safeDate(i.expiryDate)
      const consumed = safeDate(i.consumedAt) || (i.status === 'consumed' ? safeDate(i.updatedAt) : null)
      if (!exp || !consumed) return null
      if (consumed >= exp) return null
      const cost = parseCost(i.estimatedCost)
      return cost === null ? 0 : cost
    })
    .reduce((sum, v) => sum + (v || 0), 0)
}

/**
 * mostUsedLocation(items)
 */
export const mostUsedLocation = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return '—'
  const counts = {}
  for (const it of items) {
    const loc = (it?.location || '').toString().trim()
    if (!loc) continue
    counts[loc] = (counts[loc] || 0) + 1
  }
  const entries = Object.entries(counts)
  if (!entries.length) return '—'
  entries.sort((a, b) => b[1] - a[1])
  const top = entries[0][0]
  return top.charAt(0).toUpperCase() + top.slice(1)
}

export const stockValueEstimation = (items = []) => {
  if (!Array.isArray(items)) return 0
  let total = 0
  for (const it of items) {
    const cost = parseCost(it?.estimatedCost)
    if (cost === null) continue
    let qty = 1
    if (it?.quantity !== undefined && it?.quantity !== null && it?.quantity !== '') {
      const n = Number(it.quantity)
      qty = Number.isNaN(n) ? 1 : n
    }
    total += qty * cost
  }
  return total
}
