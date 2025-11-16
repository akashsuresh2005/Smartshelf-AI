// src/components/Settings.jsx
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'
import settingsApi from '../utils/settingsApi.js'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    username: '',
    email: '',
    avatarUrl: '',
    emailEnabled: true,
    pushEnabled: true,
    reminderDays: 3,
    digest: 'weekly',
    theme: 'dark',
    accent: '#06b6d4',
    compact: false
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [pwState, setPwState] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileRef = useRef(null)
  const [revokeMsg, setRevokeMsg] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await settingsApi.get()
        if (!mounted) return

        if (data) {
          setForm(prev => ({
            ...prev,
            username: data.name ?? prev.username,
            email: data.email ?? prev.email,
            avatarUrl: data.avatarUrl ?? prev.avatarUrl,
            theme: data.theme ?? prev.theme,
            accent: data.accent ?? prev.accent,
            compact: data.layoutDensity === 'compact' ? true : prev.compact,
            emailEnabled: data.notificationPrefs?.emailEnabled ?? prev.emailEnabled,
            pushEnabled: data.notificationPrefs?.pushEnabled ?? prev.pushEnabled,
            reminderDays: data.notificationPrefs?.reminderDays ?? prev.reminderDays,
            digest: data.notificationPrefs?.digest ?? prev.digest
          }))
        } else {
          setForm(prev => ({
            ...prev,
            username: user?.name || '',
            email: user?.email || ''
          }))
        }
      } catch (e) {
        setForm(prev => ({
          ...prev,
          username: user?.name || '',
          email: user?.email || ''
        }))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [user])

  function update(k, v) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function onSave(e) {
    e?.preventDefault()
    if (saving) return
    setSaving(true); setMsg('')
    try {
      const payload = {
        name: form.username,
        theme: form.theme,
        accent: form.accent,
        layoutDensity: form.compact ? 'compact' : 'spacious',
        notificationPrefs: {
          emailEnabled: !!form.emailEnabled,
          pushEnabled: !!form.pushEnabled,
          reminderDays: Number(form.reminderDays),
          digest: form.digest
        }
      }

      const updated = await settingsApi.update(payload)

      if (typeof refreshUser === 'function') {
        try { await refreshUser() } catch (e) { /* ignore */ }
      }

      if (updated) {
        setForm(prev => ({
          ...prev,
          username: updated.name ?? prev.username,
          email: updated.email ?? prev.email,
          avatarUrl: updated.avatarUrl ?? prev.avatarUrl,
          theme: updated.theme ?? prev.theme,
          accent: updated.accent ?? prev.accent,
          compact: updated.layoutDensity === 'compact' ? true : prev.compact,
          emailEnabled: updated.notificationPrefs?.emailEnabled ?? prev.emailEnabled,
          pushEnabled: updated.notificationPrefs?.pushEnabled ?? prev.pushEnabled,
          reminderDays: updated.notificationPrefs?.reminderDays ?? prev.reminderDays,
          digest: updated.notificationPrefs?.digest ?? prev.digest
        }))
      }

      setMsg('Settings saved.')
    } catch (err) {
      console.error('[Settings] save failed', err)
      setMsg('Failed to save.')
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  async function onChangePassword() {
    setPwMsg('')
    if (!pwState.currentPassword || !pwState.newPassword) {
      setPwMsg('Fill both fields')
      return
    }
    if (pwState.newPassword !== pwState.confirm) {
      setPwMsg('New password and confirm do not match')
      return
    }
    try {
      await api.put('/users/me/password', {
        currentPassword: pwState.currentPassword,
        newPassword: pwState.newPassword
      })
      setPwState({ currentPassword: '', newPassword: '', confirm: '' })
      setPwMsg('Password changed.')
      setTimeout(()=>setPwMsg(''), 3000)
    } catch (err) {
      console.error('[Settings] change password failed', err)
      setPwMsg(err?.response?.data?.error || 'Failed to change password')
    }
  }

  async function onUploadAvatar(e) {
    const file = e?.target?.files?.[0]
    if (!file) return
    const allowed = ['image/png','image/jpeg','image/jpg','image/webp']
    if (!allowed.includes(file.type)) {
      alert('Use PNG/JPG/WebP image')
      return
    }
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      setAvatarUploading(true)
      const { data } = await api.post('/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (data?.avatarUrl) {
        setForm(prev => ({ ...prev, avatarUrl: data.avatarUrl }))
        if (typeof refreshUser === 'function') {
          try { await refreshUser() } catch {}
        }
        alert('Avatar uploaded')
      } else {
        alert('Upload finished')
      }
    } catch (err) {
      console.error('[Settings] avatar upload failed', err)
      alert('Avatar upload failed')
    } finally {
      setAvatarUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // Avatar remove
  async function onRemoveAvatar() {
    if (!confirm('Remove avatar?')) return
    try {
      await api.delete('/users/me/avatar')
      setForm(prev => ({ ...prev, avatarUrl: '' }))
      if (typeof refreshUser === 'function') {
        try { await refreshUser() } catch {}
      }
      alert('Avatar removed')
    } catch (err) {
      console.error('[Settings] remove avatar failed', err)
      alert('Failed to remove avatar')
    }
  }

  // Revoke sessions
  async function onRevokeSessions() {
    if (!confirm('Revoke other sessions? This will require re-login on other devices.')) return
    setRevokeMsg('')
    try {
      await settingsApi.revokeSessions()
      setRevokeMsg('Sessions revoked.')
      setTimeout(()=>setRevokeMsg(''),3000)
    } catch (err) {
      console.error('[Settings] revoke sessions failed', err)
      setRevokeMsg('Failed to revoke sessions')
    }
  }

  // Test notification
  async function onTestNotification() {
    try {
      const res = await settingsApi.test()
      if (res?.ok) alert('Test notification triggered on server (activity recorded).')
      else alert('Test triggered (server did not confirm).')
    } catch (err) {
      console.error('[Settings] test notification failed', err)
      alert('Failed to trigger test notification')
    }
  }

  if (loading) return <div className="p-8">Loading settings…</div>

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-sm text-gray-500">Manage account, security, notifications and appearance</p>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {/* Account */}
        <section className="card p-4 bg-white/5 border border-slate-800 rounded-lg">
          <h2 className="font-medium mb-2 text-lg text-slate-100">Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs text-slate-400">Username (editable)</label>
              <input
                value={form.username}
                onChange={e => update('username', e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 text-lg"
              />

              <label className="text-xs text-slate-400">Email (read-only)</label>
              <input value={form.email} readOnly className="w-full rounded-lg bg-slate-900/40 border border-slate-700 text-slate-300 px-3 py-2" />

              <div className="flex items-center gap-3 mt-2">
                <label className="rounded bg-indigo-600 text-white px-3 py-2 cursor-pointer">
                  {avatarUploading ? 'Uploading…' : 'Change avatar'}
                  <input ref={fileRef} type="file" accept="image/*" onChange={onUploadAvatar} className="hidden" />
                </label>
                <button type="button" onClick={onRemoveAvatar} className="rounded border px-3 py-2 text-slate-100">Remove avatar</button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Sign out from this device? (This will log you out)')) {
                      alert('Local sign out not implemented here. Use profile menu to sign out.');
                    }
                  }}
                  className="rounded border px-3 py-2 text-slate-100"
                >
                  Sign out (this browser)
                </button>
              </div>

              <div className="text-sm text-slate-400 mt-2">Signed in as <span className="font-medium text-slate-200">{user?.name || user?.email}</span></div>
            </div>

            <div className="flex items-center justify-center">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="avatar" className="w-28 h-28 rounded-full object-cover" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-slate-800 flex items-center justify-center text-2xl text-cyan-300">
                  {form.username ? form.username.charAt(0).toUpperCase() : (form.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="card p-4 bg-white/5 border border-slate-800 rounded-lg">
          <h2 className="font-medium mb-2 text-lg text-slate-100">Security</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs text-slate-400">Current password</label>
                <input autoComplete="current-password" type="password" value={pwState.currentPassword} onChange={e=>setPwState(s=>({...s,currentPassword:e.target.value}))} className="w-full rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2" />
              </div>
              <div>
                <label className="text-xs text-slate-400">New password</label>
                <input autoComplete="new-password" type="password" value={pwState.newPassword} onChange={e=>setPwState(s=>({...s,newPassword:e.target.value}))} className="w-full rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Confirm</label>
                <input autoComplete="new-password" type="password" value={pwState.confirm} onChange={e=>setPwState(s=>({...s,confirm:e.target.value}))} className="w-full rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2" />
                <div className="mt-2">
                  <button type="button" onClick={onChangePassword} className="rounded bg-indigo-600 text-white px-3 py-2">Change password</button>
                </div>
                {pwMsg && <div className="text-sm text-red-500 mt-1">{pwMsg}</div>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300">Enable 2-factor (placeholder)</label>
              <input type="checkbox" checked={false} readOnly className="ml-auto" />
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={onRevokeSessions} className="rounded border px-3 py-2 text-slate-100">Sign out everywhere</button>
              {revokeMsg && <div className="text-sm text-green-400">{revokeMsg}</div>}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="card p-4 bg-white/5 border border-slate-800 rounded-lg">
          <h2 className="font-medium mb-2 text-lg text-slate-100">Notifications & reminders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div>
              <label className="text-xs text-slate-400">Email notifications</label>
              <div className="mt-1">
                <input type="checkbox" checked={form.emailEnabled} onChange={e=>update('emailEnabled', e.target.checked)} />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Push notifications</label>
              <div className="mt-1">
                <input type="checkbox" checked={form.pushEnabled} onChange={e=>update('pushEnabled', e.target.checked)} />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Reminder threshold (days)</label>
              <select value={form.reminderDays} onChange={e=>update('reminderDays', Number(e.target.value))} className="w-full rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2">
                {[1,3,7].map(n=> <option key={n} value={n}>{n} day(s)</option>)}
              </select>
            </div>

            <div className="md:col-span-2 mt-2">
              <label className="text-xs text-slate-400">Digest schedule</label>
              <div className="mt-1">
                <select value={form.digest} onChange={e=>update('digest', e.target.value)} className="rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2">
                  <option value="off">Off</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <button type="button" onClick={onTestNotification} className="ml-3 underline text-sm text-slate-300">Test notification</button>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="card p-4 bg-white/5 border border-slate-800 rounded-lg">
          <h2 className="font-medium mb-2 text-lg text-slate-100">Appearance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div>
              <label className="text-xs text-slate-400">Theme</label>
              <select value={form.theme} onChange={e=>update('theme', e.target.value)} className="w-full rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">Accent</label>
              <div className="mt-1">
                <input type="color" value={form.accent} onChange={e=>update('accent', e.target.value)} className="w-12 h-10 p-0 rounded-md border border-slate-700" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Layout density</label>
              <div className="mt-1">
                <select value={form.compact ? 'compact' : 'spacious'} onChange={e=>update('compact', e.target.value === 'compact')} className="rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2">
                  <option value="spacious">Spacious</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="rounded bg-indigo-600 text-white px-4 py-2">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <div className="text-sm text-green-600">{msg}</div>
        </div>
      </form>
    </div>
  )
}
