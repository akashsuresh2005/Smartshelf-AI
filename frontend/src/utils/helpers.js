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
import { v4 as uuidv4 } from 'uuid'

export const daysUntil = (dateStr) => {
  const today = new Date()
  const target = new Date(dateStr)
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  return diff
}

export const expiryBadge = (dateStr) => {
  const d = daysUntil(dateStr)
  if (d < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700' }
  if (d <= 3) return { label: `Expiring in ${d}d`, color: 'bg-orange-100 text-orange-700' }
  if (d <= 7) return { label: `Soon (${d}d)`, color: 'bg-yellow-100 text-yellow-700' }
  return { label: `Fresh (${d}d)`, color: 'bg-green-100 text-green-700' }
}

/* Gamification: award badges when consumed before expiry */
export const evaluateBadges = (items) => {
  const badges = []
  const now = new Date()
  // ✅ use expiryDate (not 'expiry')
  const consumedEarly = items.filter(
    (i) => i.consumedAt && i.expiryDate && new Date(i.consumedAt) < new Date(i.expiryDate)
  )
  if (consumedEarly.length >= 1) {
    badges.push({ id: uuidv4(), name: 'Fresh Saver', description: 'Consumed before expiry', date: now.toISOString() })
  }
  if (consumedEarly.length >= 10) {
    badges.push({ id: uuidv4(), name: 'Expiry Ninja', description: '10+ items before expiry', date: now.toISOString() })
  }
  return badges
}

/* Money Saved: sum of estimated costs for items consumed before expiry */
export const moneySaved = (items) => {
  return items
    .filter((i) => i.consumedAt && i.expiryDate && new Date(i.consumedAt) < new Date(i.expiryDate))
    .reduce((sum, i) => sum + (Number(i.estimatedCost) || 0), 0)
}
