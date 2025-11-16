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
    try {
      const { data } = await api.get('/notifications/prefs')
      const next = {
        emailEnabled: !!data.emailEnabled,
        expiringSoon: !!data.expiringSoon,
        expired: !!data.expired,
        digestDaily: !!data.digestDaily,
        digestWeekly: !!data.digestWeekly,
      }
      setPrefs(next)
      setInitial(next)
    } catch (e) {
      setError('Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

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
      await api.put('/notifications/prefs', prefs)
      setInitial(prefs)
      setInfo('Preferences saved')
    } catch {
      setError('Failed to save preferences')
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

      <div className="flex items-center justify-end">
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
