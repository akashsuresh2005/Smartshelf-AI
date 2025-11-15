// backend/src/routes/activityRoutes.js
import { Router } from 'express'
import { createActivity, listActivities } from '../controllers/activityController.js'

const router = Router()

// POST /api/activity  → create (frontend may call this)
router.post('/', createActivity)

// GET  /api/activity?limit=50&userId=... → list
router.get('/', listActivities)

export default router

