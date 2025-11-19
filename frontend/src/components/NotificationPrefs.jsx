// src/components/NotificationPrefs.jsx
import { useEffect, useState } from 'react'
import api from '../utils/api.js'

export default function NotificationPrefs() {
  const [prefs, setPrefs] = useState({
    emailEnabled: true,
    expiringSoon: true,
    expired: true,
    digestDaily: false,
    digestWeekly: false,
  })
  const [initial, setInitial] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    setInfo('')
    try {
      // get raw response so we can inspect both response and response.data
      const res = await api.get('/notifications/prefs')
      console.debug('GET /notifications/prefs response:', res)

      // support both axios style (res.data) and fetch wrappers that return body directly
      const data = res?.data ?? res

      // defensive: if server returned null/undefined, use defaults
      const next = {
        emailEnabled: !!(data?.emailEnabled ?? prefs.emailEnabled),
        expiringSoon: !!(data?.expiringSoon ?? prefs.expiringSoon),
        expired: !!(data?.expired ?? prefs.expired),
        digestDaily: !!(data?.digestDaily ?? prefs.digestDaily),
        digestWeekly: !!(data?.digestWeekly ?? prefs.digestWeekly),
      }

      setPrefs(next)
      setInitial({ ...next })
    } catch (e) {
      // print full error for debugging
      console.error('Failed to load prefs error:', e)
      const msg =
        // axios-style error body message
        e?.response?.data?.message ||
        // fetch-like error message
        e?.message ||
        'Failed to load preferences'
      setError(msg)
      // keep UI usable: ensure prefs stays a valid object and initial is set
      setPrefs((p) => p)
      setInitial((prev) => prev ?? { ...prefs })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const toggle = (k) => {
    setInfo('')
    setPrefs((p) => ({ ...p, [k]: !p[k] }))
  }

  const changed =
    initial &&
    ['emailEnabled', 'expiringSoon', 'expired', 'digestDaily', 'digestWeekly'].some(
      (k) => initial[k] !== prefs[k]
    )

  const save = async () => {
    setSaving(true)
    setError('')
    setInfo('')
    try {
      const res = await api.put('/notifications/prefs', prefs)
      console.debug('PUT /notifications/prefs response:', res)
      setInitial({ ...prefs })
      setInfo('Preferences saved')
    } catch (e) {
      console.error('Failed to save prefs error:', e)
      const msg = e?.response?.data?.message || e?.message || 'Failed to save preferences'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-slate-900/60 rounded-lg p-5 border border-slate-800/50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-cyan-400">
          Manage your email notifications & preferences
        </h3>
        {loading && <span className="text-xs text-slate-500">Loading…</span>}
      </div>

      {error && (
        <div className="rounded-lg p-3 text-sm bg-red-950/50 text-red-300 border border-red-800/50">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-lg p-3 text-sm bg-green-950/50 text-green-300 border border-green-800/50">
          {info}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2">
          <input
            type="checkbox"
            checked={prefs.emailEnabled}
            onChange={() => toggle('emailEnabled')}
          />
          <span className="text-slate-200">Email notifications enabled</span>
        </label>

        <label className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2">
          <input
            type="checkbox"
            checked={prefs.expiringSoon}
            onChange={() => toggle('expiringSoon')}
          />
          <span className="text-slate-200">Notify when items are expiring soon</span>
        </label>

        <label className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2">
          <input
            type="checkbox"
            checked={prefs.expired}
            onChange={() => toggle('expired')}
          />
          <span className="text-slate-200">Notify when items are expired</span>
        </label>

        <label className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2">
          <input
            type="checkbox"
            checked={prefs.digestDaily}
            onChange={() => toggle('digestDaily')}
          />
          <span className="text-slate-200">Daily email digest</span>
        </label>

        <label className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2">
          <input
            type="checkbox"
            checked={prefs.digestWeekly}
            onChange={() => toggle('digestWeekly')}
          />
          <span className="text-slate-200">Weekly email digest</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3">
        {error && (
          <button
            className="rounded-lg bg-slate-700 text-white px-3 py-2 text-sm hover:bg-slate-600"
            onClick={load}
          >
            Retry
          </button>
        )}

        <button
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-60"
          onClick={save}
          disabled={saving || !changed}
        >
          {saving ? 'Saving…' : changed ? 'Save preferences' : 'Saved'}
        </button>
      </div>
    </div>
  )
}
