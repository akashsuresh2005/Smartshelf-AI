
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
    digest: 'weekly'
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
        notificationPrefs: {
          emailEnabled: !!form.emailEnabled,
          pushEnabled: !!form.pushEnabled,
          reminderDays: Number(form.reminderDays),
          digest: form.digest
        }
      }

      const updated = await settingsApi.update(payload)

      if (updated) {
        setForm(prev => ({
          ...prev,
          username: updated.name ?? prev.username,
          email: updated.email ?? prev.email,
          avatarUrl: updated.avatarUrl ?? prev.avatarUrl,
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
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, rgba(2,10,17,1) 0%, rgba(6,14,23,1) 40%, rgba(8,12,22,1) 100%)'
      }}
    >
      <style>{`
        .frost-card {
          background: linear-gradient(180deg, rgba(12,17,24,0.62), rgba(8,12,20,0.62));
          border: 1px solid rgba(44,54,66,0.5);
        }
        .card-shadow { box-shadow: 0 6px 18px rgba(3,8,14,0.65), inset 0 1px 0 rgba(255,255,255,0.02); }

        .page-title {
          font-weight: 600;
          font-size: 2.4rem;
          line-height: 1.05;
          color: #06b6d4;
        }
        .page-sub { color: rgba(148,163,184,0.9); }

        .deep-input {
          background: #07101a;
          border: 1px solid rgba(67,84,97,0.28);
          color: #e6eef6;
          transition: box-shadow .12s ease, border-color .12s ease;
        }
        .deep-input:focus, select.deep-input:focus {
          outline: none;
          border-color: rgba(6,182,212,0.92);
          box-shadow: 0 0 0 6px rgba(6,182,212,0.06);
        }

        select.deep-input {
          appearance: none;
          padding-right: 2.25rem;
        }

        .btn {
          border-radius: 0.6rem;
          padding: 0.6rem 1rem;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease;
          box-shadow: 0 6px 14px rgba(2,6,12,0.45);
        }
        .btn-outline {
          background: transparent;
          border: 1px solid rgba(107,114,128,0.18);
          color: #d1d5db;
        }
        .btn-primary {
          color: white;
          background: linear-gradient(90deg,#06b6d4 0%, #0ea5b7 40%);
        }

        @keyframes blink {
          50% { transform: translateY(-3px); filter: brightness(1.16); }
        }
        .btn:hover { animation: blink 650ms linear infinite; }

        .avatar-initial {
          width: 128px;
          height: 128px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 2rem;
          color: #fff;
          border: 4px solid rgba(255,255,255,0.06);
          background: radial-gradient(circle at 30% 25%, #2d6ee6 0%, #1f55d9 55%);
          box-shadow: 0 10px 22px rgba(22,45,88,0.55);
        }
      `}</style>

      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="page-title">Settings</h1>
          <p className="page-sub mt-2">Manage account, security, notifications and appearance</p>
        </div>

        <form onSubmit={onSave} className="space-y-6">

          {/* Account */}
          <section className="frost-card card-shadow p-6 rounded-xl">
            <h2 className="font-semibold mb-4 text-xl text-slate-200">Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-3">

                <label className="text-sm font-medium text-slate-300">Username (editable)</label>
                <input
                  value={form.username}
                  onChange={e => update('username', e.target.value)}
                  className="w-full rounded-lg deep-input px-4 py-3 text-lg"
                />

                <label className="text-sm font-medium text-slate-300 block mt-4">Email (read-only)</label>
                <input value={form.email} readOnly className="w-full rounded-lg deep-input px-4 py-3 text-slate-300" />

                <div className="flex items-center gap-3 mt-4">
                  {/* ONLY CHANGE AVATAR BUTTON REMAINS */}
                  <label className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                    {avatarUploading ? 'Uploading…' : 'Change avatar'}
                    <input ref={fileRef} type="file" accept="image/*" onChange={onUploadAvatar} className="hidden" />
                  </label>
                </div>

                <div className="text-sm text-slate-400 mt-3">
                  Signed in as <span className="font-medium text-slate-200">{user?.name || user?.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-xl" />
                ) : (
                  <div className="avatar-initial">
                    {form.username ? form.username.charAt(0).toUpperCase() : (form.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="frost-card card-shadow p-6 rounded-xl">
            <h2 className="font-semibold mb-4 text-xl text-slate-200">Security</h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4">
                <label className="text-sm font-medium text-slate-300">Current password</label>
                <input
                  type="password"
                  value={pwState.currentPassword}
                  onChange={e=>setPwState(s=>({...s,currentPassword:e.target.value}))}
                  className="w-full rounded-lg deep-input px-4 py-2"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-sm font-medium text-slate-300">New password</label>
                <input
                  type="password"
                  value={pwState.newPassword}
                  onChange={e=>setPwState(s=>({...s,newPassword:e.target.value}))}
                  className="w-full rounded-lg deep-input px-4 py-2"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-sm font-medium text-slate-300">Confirm</label>
                <div className="flex items-start gap-3">
                  <input
                    type="password"
                    value={pwState.confirm}
                    onChange={e=>setPwState(s=>({...s,confirm:e.target.value}))}
                    className="w-full rounded-lg deep-input px-4 py-2"
                  />
                  <button type="button" onClick={onChangePassword} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    Change password
                  </button>
                </div>

                {pwMsg && <div className="text-sm text-teal-300 mt-3 font-medium">{pwMsg}</div>}
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#05121a] rounded-lg border border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-300 font-medium">Enable 2-factor (placeholder)</div>
              <input type="checkbox" checked={false} readOnly className="w-5 h-5" />
            </div>

            <div className="mt-4">
              <button type="button" onClick={onRevokeSessions} className="btn btn-outline">Sign out everywhere</button>
              {revokeMsg && <div className="text-sm text-green-400 inline-block ml-4 font-medium">{revokeMsg}</div>}
            </div>
          </section>

          {/* Notifications */}
          <section className="frost-card card-shadow p-6 rounded-xl">
            <h2 className="font-semibold mb-4 text-xl text-slate-200">Notifications & reminders</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

              <div className="p-3 bg-[#05121a] rounded-lg border border-slate-700">
                <label className="text-sm font-medium text-slate-300 block mb-2">Email notifications</label>
                <input type="checkbox" checked={form.emailEnabled} onChange={e=>update('emailEnabled', e.target.checked)} className="w-5 h-5" />
              </div>

              <div className="p-3 bg-[#05121a] rounded-lg border border-slate-700">
                <label className="text-sm font-medium text-slate-300 block mb-2">Push notifications</label>
                <input type="checkbox" checked={form.pushEnabled} onChange={e=>update('pushEnabled', e.target.checked)} className="w-5 h-5" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Reminder threshold (days)</label>
                <select value={form.reminderDays} onChange={e=>update('reminderDays', Number(e.target.value))} className="w-full rounded-lg deep-input px-4 py-2">
                  {[1,3,7].map(n=> <option key={n} value={n}>{n} day(s)</option>)}
                </select>
              </div>

              <div className="md:col-span-3 mt-2">
                <label className="text-sm font-medium text-slate-300 block mb-2">Digest schedule</label>
                <div className="flex items-center gap-3">
                  <select value={form.digest} onChange={e=>update('digest', e.target.value)} className="rounded-lg deep-input px-4 py-2">
                    <option value="off">Off</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <button type="button" onClick={onTestNotification} className="btn btn-outline">Test notification</button>
                </div>
              </div>
            </div>
          </section>

          <div className="save-row flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ paddingLeft: '1.4rem', paddingRight: '1.4rem' }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <div className="text-sm text-green-400 font-medium">{msg}</div>
          </div>

        </form>
      </div>
    </div>
  )
}



