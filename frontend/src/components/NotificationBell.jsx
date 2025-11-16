
import { useEffect, useRef, useState } from 'react'
import api from '../utils/api.js'

export default function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const last = useRef(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    const token = localStorage.getItem('token')
    if (!token) {
      setUnread(0)
      setLoading(false)
      return () => { mounted.current = false }
    }

    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count', { validateStatus: s => s < 500 })
        const valueFromResponse =
          res?.data?.unread ?? res?.data?.total ?? res?.data?.count ?? (typeof res?.data === 'number' ? res.data : undefined)

        const value = (valueFromResponse !== undefined && valueFromResponse !== null)
          ? Number(valueFromResponse)
          : last.current || 0

        last.current = value
        if (mounted.current) setUnread(value)
      } catch (err) {
        const status = err?.response?.status
        if (status && status !== 401) console.error('Unread fetch failed', status)
      } finally {
        if (mounted.current) setLoading(false)
      }
    }

    // initial fetch
    fetchUnread()

    // slow polling: once per minute
    const id = setInterval(() => {
      if (!localStorage.getItem('token')) return
      fetchUnread()
    }, 60_000)

    return () => {
      mounted.current = false
      clearInterval(id)
    }
  }, [])

  if (loading) return <div className="bell">…</div>

  return (
    <div className="relative" aria-live="polite">
      <span className="text-2xl">🔔</span>
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
          {unread}
        </span>
      )}
    </div>
  )
}

