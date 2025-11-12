// import { Router } from 'express'
// import { categorySummary, expiryStats } from '../controllers/analyticsController.js'
// import { requireAuth } from '../middleware/authMiddleware.js'

// const router = Router()
// router.get('/category-summary', requireAuth, categorySummary)
// router.get('/expiry-stats', requireAuth, expiryStats)
// export default router
import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { categorySummary, expiryStats, dashboardAnalytics } from '../controllers/analyticsController.js'

const router = Router()

// kept old endpoints (backward compatible)
router.get('/category-summary', requireAuth, categorySummary)
router.get('/expiry-stats', requireAuth, expiryStats)

// NEW: one-stop analytics endpoint for the page
router.get('/dashboard', requireAuth, dashboardAnalytics)

export default router

