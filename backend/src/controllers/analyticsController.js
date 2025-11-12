// import Item from '../models/Item.js'

// export async function categorySummary(req, res, next) {
//   try {
//     const result = await Item.aggregate([
//       { $match: { userId: req.user.id } },
//       { $group: { _id: '$category', count: { $sum: 1 } } }
//     ])
//     res.json(result.map((r) => ({ category: r._id, count: r.count })))
//   } catch (err) {
//     next(err)
//   }
// }

// export async function expiryStats(req, res, next) {
//   try {
//     const items = await Item.find({ userId: req.user.id })
//     const expiringSoon = items.filter((i) => {
//       const d = Math.ceil((new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
//       return d <= 7 && d >= 0
//     }).length
//     const expired = items.filter((i) => i.status === 'expired').length
//     const consumed = items.filter((i) => i.status === 'consumed').length
//     res.json({ expiringSoon, expired, consumed })
//   } catch (err) {
//     next(err)
//   }
// }
import mongoose from 'mongoose'
import Item from '../models/Item.js'

/** (kept) simple category summary */
export async function categorySummary(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const result = await Item.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
    res.json(result.map((r) => ({ category: r._id, count: r.count })))
  } catch (err) {
    next(err)
  }
}

/** (kept) simple expiry stats */
export async function expiryStats(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const [soonAgg, statusAgg] = await Promise.all([
      Item.aggregate([
        { $match: { userId } },
        {
          $addFields: {
            daysLeft: {
              $ceil: {
                $divide: [{ $subtract: ['$expiryDate', new Date()] }, 1000 * 60 * 60 * 24]
              }
            }
          }
        },
        { $match: { daysLeft: { $gte: 0, $lte: 7 } } },
        { $count: 'expiringSoon' }
      ]),
      Item.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ])

    const expiringSoon = soonAgg[0]?.expiringSoon || 0
    const statusMap = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]))
    const expired = statusMap['expired'] || 0
    const consumed = statusMap['consumed'] || 0

    res.json({ expiringSoon, expired, consumed })
  } catch (err) {
    next(err)
  }
}

/**
 * NEW: single dashboard payload so the FE can render everything in one call.
 * - categoryCounts: [{category, count}]
 * - statusCounts: { active, expiringSoon, expired, consumed }
 * - topHighValue: top 10 by estimatedCost (desc)
 * - topLowValue: top 10 by estimatedCost (asc)
 * - upcomingExpirations: next 10 by expiryDate (excluding consumed)
 */
export async function dashboardAnalytics(req, res, next) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' })

    const userId = new mongoose.Types.ObjectId(req.user.id)
    const now = new Date()

    // 1) Category counts
    const categoryCounts = await Item.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } }
    ])

    // 2) Pull only needed fields once
    const all = await Item.find(
      { userId },
      { name: 1, category: 1, status: 1, expiryDate: 1, estimatedCost: 1, barcode: 1 }
    )

    // 3) Status metrics
    let active = 0, expired = 0, consumed = 0, expiringSoon = 0
    for (const it of all) {
      const exp = new Date(it.expiryDate)
      const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
      if (it.status === 'consumed') consumed++
      else if (it.status === 'expired') expired++
      else active++

      if (days >= 0 && days <= 7 && it.status !== 'consumed') expiringSoon++
    }

    // 4) High / Low value (only items with numeric estimatedCost)
    const costItems = all.filter(i => typeof i.estimatedCost === 'number')
    const byCostDesc = [...costItems].sort((a, b) => b.estimatedCost - a.estimatedCost)
    const byCostAsc  = [...costItems].sort((a, b) => a.estimatedCost - b.estimatedCost)
    const topHighValue = byCostDesc.slice(0, 10)
    const topLowValue  = byCostAsc.slice(0, 10)

    // 5) Upcoming expirations (next 10)
    const upcomingExpirations = [...all]
      .filter(i => new Date(i.expiryDate) >= now && i.status !== 'consumed')
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .slice(0, 10)

    res.json({
      categoryCounts,
      statusCounts: { active, expiringSoon, expired, consumed },
      topHighValue,
      topLowValue,
      upcomingExpirations
    })
  } catch (err) {
    next(err)
  }
}

