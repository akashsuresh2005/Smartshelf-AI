// // // src/components/Settings.jsx
// // import { useEffect, useState, useRef } from 'react'
// // import { useAuth } from '../context/AuthContext.jsx'
// // import api from '../utils/api.js'
// // import settingsApi from '../utils/settingsApi.js'

// // export default function Settings() {
// //   const { user, refreshUser } = useAuth()
// //   const [loading, setLoading] = useState(true)
// //   const [form, setForm] = useState({
// //     username: '',
// //     email: '',
// //     avatarUrl: '',
// //     emailEnabled: true,
// //     pushEnabled: true,
// //     reminderDays: 3,
// //     digest: 'weekly',
// //     theme: 'dark',
// //     accent: '#06b6d4',
// //     compact: false
// //   })
// //   const [saving, setSaving] = useState(false)
// //   const [msg, setMsg] = useState('')
// //   const [pwState, setPwState] = useState({ currentPassword: '', newPassword: '', confirm: '' })
// //   const [pwMsg, setPwMsg] = useState('')
// //   const [avatarUploading, setAvatarUploading] = useState(false)
// //   const fileRef = useRef(null)
// //   const [revokeMsg, setRevokeMsg] = useState('')

// //   useEffect(() => {
// //     let mounted = true
// //     ;(async () => {
// //       try {
// //         setLoading(true)
// //         const data = await settingsApi.get()
// //         if (!mounted) return

// //         if (data) {
// //           setForm(prev => ({
// //             ...prev,
// //             username: data.name ?? prev.username,
// //             email: data.email ?? prev.email,
// //             avatarUrl: data.avatarUrl ?? prev.avatarUrl,
// //             theme: data.theme ?? prev.theme,
// //             accent: data.accent ?? prev.accent,
// //             compact: data.layoutDensity === 'compact' ? true : prev.compact,
// //             emailEnabled: data.notificationPrefs?.emailEnabled ?? prev.emailEnabled,
// //             pushEnabled: data.notificationPrefs?.pushEnabled ?? prev.pushEnabled,
// //             reminderDays: data.notificationPrefs?.reminderDays ?? prev.reminderDays,
// //             digest: data.notificationPrefs?.digest ?? prev.digest
// //           }))
// //         } else {
// //           setForm(prev => ({
// //             ...prev,
// //             username: user?.name || '',
// //             email: user?.email || ''
// //           }))
// //         }
// //       } catch (e) {
// //         setForm(prev => ({
// //           ...prev,
// //           username: user?.name || '',
// //           email: user?.email || ''
// //         }))
// //       } finally {
// //         if (mounted) setLoading(false)
// //       }
// //     })()
// //     return () => { mounted = false }
// //   }, [user])

// //   function update(k, v) {
// //     setForm(prev => ({ ...prev, [k]: v }))
// //   }

// //   async function onSave(e) {
// //     e?.preventDefault()
// //     if (saving) return
// //     setSaving(true); setMsg('')
// //     try {
// //       const payload = {
// //         name: form.username,
// //         theme: form.theme,
// //         accent: form.accent,
// //         layoutDensity: form.compact ? 'compact' : 'spacious',
// //         notificationPrefs: {
// //           emailEnabled: !!form.emailEnabled,
// //           pushEnabled: !!form.pushEnabled,
// //           reminderDays: Number(form.reminderDays),
// //           digest: form.digest
// //         }
// //       }

// //       const updated = await settingsApi.update(payload)

// //       if (typeof refreshUser === 'function') {
// //         try { await refreshUser() } catch (e) { /* ignore */ }
// //       }

// //       if (updated) {
// //         setForm(prev => ({
// //           ...prev,
// //           username: updated.name ?? prev.username,
// //           email: updated.email ?? prev.email,
// //           avatarUrl: updated.avatarUrl ?? prev.avatarUrl,
// //           theme: updated.theme ?? prev.theme,
// //           accent: updated.accent ?? prev.accent,
// //           compact: updated.layoutDensity === 'compact' ? true : prev.compact,
// //           emailEnabled: updated.notificationPrefs?.emailEnabled ?? prev.emailEnabled,
// //           pushEnabled: updated.notificationPrefs?.pushEnabled ?? prev.pushEnabled,
// //           reminderDays: updated.notificationPrefs?.reminderDays ?? prev.reminderDays,
// //           digest: updated.notificationPrefs?.digest ?? prev.digest
// //         }))
// //       }

// //       setMsg('Settings saved.')
// //     } catch (err) {
// //       console.error('[Settings] save failed', err)
// //       setMsg('Failed to save.')
// //     } finally {
// //       setSaving(false)
// //       setTimeout(() => setMsg(''), 3000)
// //     }
// //   }

// //   async function onChangePassword() {
// //     setPwMsg('')
// //     if (!pwState.currentPassword || !pwState.newPassword) {
// //       setPwMsg('Fill both fields')
// //       return
// //     }
// //     if (pwState.newPassword !== pwState.confirm) {
// //       setPwMsg('New password and confirm do not match')
// //       return
// //     }
// //     try {
// //       await api.put('/users/me/password', {
// //         currentPassword: pwState.currentPassword,
// //         newPassword: pwState.newPassword
// //       })
// //       setPwState({ currentPassword: '', newPassword: '', confirm: '' })
// //       setPwMsg('Password changed.')
// //       setTimeout(()=>setPwMsg(''), 3000)
// //     } catch (err) {
// //       console.error('[Settings] change password failed', err)
// //       setPwMsg(err?.response?.data?.error || 'Failed to change password')
// //     }
// //   }

// //   async function onUploadAvatar(e) {
// //     const file = e?.target?.files?.[0]
// //     if (!file) return
// //     const allowed = ['image/png','image/jpeg','image/jpg','image/webp']
// //     if (!allowed.includes(file.type)) {
// //       alert('Use PNG/JPG/WebP image')
// //       return
// //     }
// //     const fd = new FormData()
// //     fd.append('avatar', file)
// //     try {
// //       setAvatarUploading(true)
// //       const { data } = await api.post('/users/me/avatar', fd, {
// //         headers: { 'Content-Type': 'multipart/form-data' }
// //       })
// //       if (data?.avatarUrl) {
// //         setForm(prev => ({ ...prev, avatarUrl: data.avatarUrl }))
// //         if (typeof refreshUser === 'function') {
// //           try { await refreshUser() } catch {}
// //         }
// //         alert('Avatar uploaded')
// //       } else {
// //         alert('Upload finished')
// //       }
// //     } catch (err) {
// //       console.error('[Settings] avatar upload failed', err)
// //       alert('Avatar upload failed')
// //     } finally {
// //       setAvatarUploading(false)
// //       if (fileRef.current) fileRef.current.value = ''
// //     }
// //   }

// //   // Avatar remove
// //   async function onRemoveAvatar() {
// //     if (!confirm('Remove avatar?')) return
// //     try {
// //       await api.delete('/users/me/avatar')
// //       setForm(prev => ({ ...prev, avatarUrl: '' }))
// //       if (typeof refreshUser === 'function') {
// //         try { await refreshUser() } catch {}
// //       }
// //       alert('Avatar removed')
// //     } catch (err) {
// //       console.error('[Settings] remove avatar failed', err)
// //       alert('Failed to remove avatar')
// //     }
// //   }

// //   // Revoke sessions
// //   async function onRevokeSessions() {
// //     if (!confirm('Revoke other sessions? This will require re-login on other devices.')) return
// //     setRevokeMsg('')
// //     try {
// //       await settingsApi.revokeSessions()
// //       setRevokeMsg('Sessions revoked.')
// //       setTimeout(()=>setRevokeMsg(''),3000)
// //     } catch (err) {
// //       console.error('[Settings] revoke sessions failed', err)
// //       setRevokeMsg('Failed to revoke sessions')
// //     }
// //   }

// //   // Test notification
// //   async function onTestNotification() {
// //     try {
// //       const res = await settingsApi.test()
// //       if (res?.ok) alert('Test notification triggered on server (activity recorded).')
// //       else alert('Test triggered (server did not confirm).')
// //     } catch (err) {
// //       console.error('[Settings] test notification failed', err)
// //       alert('Failed to trigger test notification')
// //     }
// //   }

// //   if (loading) return <div className="p-8">Loading settings…</div>

// //   return (
// //     <div className="max-w-5xl mx-auto p-6">
// //       <div className="flex items-center justify-between mb-6">
// //         <div>
// //           <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-slate-100">Settings</h1>
// //           <p className="text-sm text-gray-500">Manage account, security, notifications and appearance</p>
// //         </div>
// //       </div>

// //       <form onSubmit={onSave} className="space-y-6">
// //         {/* Account */}
// //         <section className="card p-4 bg-white/5 border border-slate-800 rounded-lg">
// //           <h2 className="font-medium mb-2 text-lg text-slate-100">Account</h2>
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
// //             <div className="md:col-span-2 space-y-3">
// //               <label className="text-xs text-slate-400">Username (editable)</label>
// //               <input
// //                 value={form.username}
// //                 onChange={e => update('username', e.target.value)}
// //                 className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 text-lg"
// //               />

// //               <label className="text-xs text-slate-400">Email (read-only)</label>
// //               <input value={form.email} readOnly className="w-full rounded-lg bg-slate-900/40 border border-slate-700 text-slate-300 px-3 py-2" />

// //               <div className="flex items-center gap-3 mt-2">
// //                 <label className="rounded bg-indigo-600 text-white px-3 py-2 cursor-pointer">
// //                   {avatarUploading ? 'Uploading…' : 'Change avatar'}
// //                   <input ref={fileRef} type="file" accept="image/*" onChange={onUploadAvatar} className="hidden" />
// //                 </label>
// //                 <button type="button" onClick={onRemoveAvatar} className="rounded border px-3 py-2 text-slate-100">Remove avatar</button>
// //                 <button
// //                   type="button"
// //                   onClick={() => {
// //                     if (confirm('Sign out from this device? (This will log you out)')) {
// //                       alert('Local sign out not implemented here. Use profile menu to sign out.');
// //                     }
// //                   }}
// //                   className="rounded border px-3 py-2 text-slate-100"
// //                 >
// //                   Sign out (this browser)
// //                 </button>
// //               </div>

// //               <div className="text-sm text-slate-400 mt-2">Signed in as <span className="font-medium text-slate-200">{user?.name || user?.email}</span></div>
// //             </div>

// //             <div className="flex items-center justify-center">
// //               {form.avatarUrl ? (
// //                 <img src={form.avatarUrl} alt="avatar" className="w-28 h-28 rounded-full object-cover" />
// //               ) : (
// //                 <div className="w-28 h-28 rounded-full bg-slate-800 flex items-center justify-center text-2xl text-cyan-300">
// //                   {form.username ? form.username.charAt(0).toUpperCase() : (form.email || 'U').charAt(0).toUpperCase()}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </section>

// //         {/* Security */}
// //         <section className="card p-4 bg-white/5 border border-slate-800 rounded-lg">
// //           <h2 className="font-medium mb-2 text-lg text-slate-100">Security</h2>
// //           <div className="space-y-3">
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
// //               <div>
// //                 <label className="text-xs text-slate-400">Current password</label>
// //                 <input autoComplete="current-password" type="password" value={pwState.currentPassword} onChange={e=>setPwState(s=>({...s,currentPassword:e.target.value}))} className="w-full rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2" />
// //               </div>
// //               <div>
// //                 <label className="text-xs text-slate-400">New password</label>
// //                 <input autoComplete="new-password" type="password" value={pwState.newPassword} onChange={e=>setPwState(s=>({...s,newPassword:e.target.value}))} className="w-full rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2" />
// //               </div>
// //               <div>
// //                 <label className="text-xs text-slate-400">Confirm</label>
// //                 <input autoComplete="new-password" type="password" value={pwState.confirm} onChange={e=>setPwState(s=>({...s,confirm:e.target.value}))} className="w-full rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2" />
// //                 <div className="mt-2">
// //                   <button type="button" onClick={onChangePassword} className="rounded bg-indigo-600 text-white px-3 py-2">Change password</button>
// //                 </div>
// //                 {pwMsg && <div className="text-sm text-red-500 mt-1">{pwMsg}</div>}
// //               </div>
// //             </div>

// //             <div className="flex items-center gap-3">
// //               <label className="text-sm text-slate-300">Enable 2-factor (placeholder)</label>
// //               <input type="checkbox" checked={false} readOnly className="ml-auto" />
// //             </div>

// //             <div className="flex items-center gap-3">
// //               <button type="button" onClick={onRevokeSessions} className="rounded border px-3 py-2 text-slate-100">Sign out everywhere</button>
// //               {revokeMsg && <div className="text-sm text-green-400">{revokeMsg}</div>}
// //             </div>
// //           </div>
// //         </section>

// //         {/* Notifications */}
// //         <section className="card p-4 bg-white/5 border border-slate-800 rounded-lg">
// //           <h2 className="font-medium mb-2 text-lg text-slate-100">Notifications & reminders</h2>
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
// //             <div>
// //               <label className="text-xs text-slate-400">Email notifications</label>
// //               <div className="mt-1">
// //                 <input type="checkbox" checked={form.emailEnabled} onChange={e=>update('emailEnabled', e.target.checked)} />
// //               </div>
// //             </div>

// //             <div>
// //               <label className="text-xs text-slate-400">Push notifications</label>
// //               <div className="mt-1">
// //                 <input type="checkbox" checked={form.pushEnabled} onChange={e=>update('pushEnabled', e.target.checked)} />
// //               </div>
// //             </div>

// //             <div>
// //               <label className="text-xs text-slate-400">Reminder threshold (days)</label>
// //               <select value={form.reminderDays} onChange={e=>update('reminderDays', Number(e.target.value))} className="w-full rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2">
// //                 {[1,3,7].map(n=> <option key={n} value={n}>{n} day(s)</option>)}
// //               </select>
// //             </div>

// //             <div className="md:col-span-2 mt-2">
// //               <label className="text-xs text-slate-400">Digest schedule</label>
// //               <div className="mt-1">
// //                 <select value={form.digest} onChange={e=>update('digest', e.target.value)} className="rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2">
// //                   <option value="off">Off</option>
// //                   <option value="daily">Daily</option>
// //                   <option value="weekly">Weekly</option>
// //                 </select>
// //                 <button type="button" onClick={onTestNotification} className="ml-3 underline text-sm text-slate-300">Test notification</button>
// //               </div>
// //             </div>
// //           </div>
// //         </section>

// //         {/* Appearance */}
// //         <section className="card p-4 bg-white/5 border border-slate-800 rounded-lg">
// //           <h2 className="font-medium mb-2 text-lg text-slate-100">Appearance</h2>
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
// //             <div>
// //               <label className="text-xs text-slate-400">Theme</label>
// //               <select value={form.theme} onChange={e=>update('theme', e.target.value)} className="w-full rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2">
// //                 <option value="light">Light</option>
// //                 <option value="dark">Dark</option>
// //                 <option value="system">System</option>
// //               </select>
// //             </div>

// //             <div>
// //               <label className="text-xs text-slate-400">Accent</label>
// //               <div className="mt-1">
// //                 <input type="color" value={form.accent} onChange={e=>update('accent', e.target.value)} className="w-12 h-10 p-0 rounded-md border border-slate-700" />
// //               </div>
// //             </div>

// //             <div>
// //               <label className="text-xs text-slate-400">Layout density</label>
// //               <div className="mt-1">
// //                 <select value={form.compact ? 'compact' : 'spacious'} onChange={e=>update('compact', e.target.value === 'compact')} className="rounded bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2">
// //                   <option value="spacious">Spacious</option>
// //                   <option value="compact">Compact</option>
// //                 </select>
// //               </div>
// //             </div>
// //           </div>
// //         </section>

// //         <div className="flex items-center gap-3">
// //           <button type="submit" disabled={saving} className="rounded bg-indigo-600 text-white px-4 py-2">
// //             {saving ? 'Saving…' : 'Save changes'}
// //           </button>
// //           <div className="text-sm text-green-600">{msg}</div>
// //         </div>
// //       </form>
// //     </div>
// //   )
// // }
// // src/components/Settings.jsx
// import { useEffect, useState, useRef } from 'react'
// import { useAuth } from '../context/AuthContext.jsx'
// import api from '../utils/api.js'
// import settingsApi from '../utils/settingsApi.js'

// export default function Settings() {
//   const { user, refreshUser } = useAuth()
//   const [loading, setLoading] = useState(true)
//   const [form, setForm] = useState({
//     username: '',
//     email: '',
//     avatarUrl: '',
//     emailEnabled: true,
//     pushEnabled: true,
//     reminderDays: 3,
//     digest: 'weekly',
//     theme: 'dark',
//     accent: '#06b6d4',
//     compact: false
//   })
//   const [saving, setSaving] = useState(false)
//   const [msg, setMsg] = useState('')
//   const [pwState, setPwState] = useState({ currentPassword: '', newPassword: '', confirm: '' })
//   const [pwMsg, setPwMsg] = useState('')
//   const [avatarUploading, setAvatarUploading] = useState(false)
//   const fileRef = useRef(null)
//   const [revokeMsg, setRevokeMsg] = useState('')

//   useEffect(() => {
//     let mounted = true
//     ;(async () => {
//       try {
//         setLoading(true)
//         const data = await settingsApi.get()
//         if (!mounted) return

//         if (data) {
//           setForm(prev => ({
//             ...prev,
//             username: data.name ?? prev.username,
//             email: data.email ?? prev.email,
//             avatarUrl: data.avatarUrl ?? prev.avatarUrl,
//             theme: data.theme ?? prev.theme,
//             accent: data.accent ?? prev.accent,
//             compact: data.layoutDensity === 'compact' ? true : prev.compact,
//             emailEnabled: data.notificationPrefs?.emailEnabled ?? prev.emailEnabled,
//             pushEnabled: data.notificationPrefs?.pushEnabled ?? prev.pushEnabled,
//             reminderDays: data.notificationPrefs?.reminderDays ?? prev.reminderDays,
//             digest: data.notificationPrefs?.digest ?? prev.digest
//           }))
//         } else {
//           setForm(prev => ({
//             ...prev,
//             username: user?.name || '',
//             email: user?.email || ''
//           }))
//         }
//       } catch (e) {
//         setForm(prev => ({
//           ...prev,
//           username: user?.name || '',
//           email: user?.email || ''
//         }))
//       } finally {
//         if (mounted) setLoading(false)
//       }
//     })()
//     return () => { mounted = false }
//   }, [user])

//   function update(k, v) {
//     setForm(prev => ({ ...prev, [k]: v }))
//   }

//   async function onSave(e) {
//     e?.preventDefault()
//     if (saving) return
//     setSaving(true); setMsg('')
//     try {
//       const payload = {
//         name: form.username,
//         theme: form.theme,
//         accent: form.accent,
//         layoutDensity: form.compact ? 'compact' : 'spacious',
//         notificationPrefs: {
//           emailEnabled: !!form.emailEnabled,
//           pushEnabled: !!form.pushEnabled,
//           reminderDays: Number(form.reminderDays),
//           digest: form.digest
//         }
//       }

//       const updated = await settingsApi.update(payload)

//       if (typeof refreshUser === 'function') {
//         try { await refreshUser() } catch (e) { /* ignore */ }
//       }

//       if (updated) {
//         setForm(prev => ({
//           ...prev,
//           username: updated.name ?? prev.username,
//           email: updated.email ?? prev.email,
//           avatarUrl: updated.avatarUrl ?? prev.avatarUrl,
//           theme: updated.theme ?? prev.theme,
//           accent: updated.accent ?? prev.accent,
//           compact: updated.layoutDensity === 'compact' ? true : prev.compact,
//           emailEnabled: updated.notificationPrefs?.emailEnabled ?? prev.emailEnabled,
//           pushEnabled: updated.notificationPrefs?.pushEnabled ?? prev.pushEnabled,
//           reminderDays: updated.notificationPrefs?.reminderDays ?? prev.reminderDays,
//           digest: updated.notificationPrefs?.digest ?? prev.digest
//         }))
//       }

//       setMsg('Settings saved.')
//     } catch (err) {
//       console.error('[Settings] save failed', err)
//       setMsg('Failed to save.')
//     } finally {
//       setSaving(false)
//       setTimeout(() => setMsg(''), 3000)
//     }
//   }

//   async function onChangePassword() {
//     setPwMsg('')
//     if (!pwState.currentPassword || !pwState.newPassword) {
//       setPwMsg('Fill both fields')
//       return
//     }
//     if (pwState.newPassword !== pwState.confirm) {
//       setPwMsg('New password and confirm do not match')
//       return
//     }
//     try {
//       await api.put('/users/me/password', {
//         currentPassword: pwState.currentPassword,
//         newPassword: pwState.newPassword
//       })
//       setPwState({ currentPassword: '', newPassword: '', confirm: '' })
//       setPwMsg('Password changed.')
//       setTimeout(()=>setPwMsg(''), 3000)
//     } catch (err) {
//       console.error('[Settings] change password failed', err)
//       setPwMsg(err?.response?.data?.error || 'Failed to change password')
//     }
//   }

//   async function onUploadAvatar(e) {
//     const file = e?.target?.files?.[0]
//     if (!file) return
//     const allowed = ['image/png','image/jpeg','image/jpg','image/webp']
//     if (!allowed.includes(file.type)) {
//       alert('Use PNG/JPG/WebP image')
//       return
//     }
//     const fd = new FormData()
//     fd.append('avatar', file)
//     try {
//       setAvatarUploading(true)
//       const { data } = await api.post('/users/me/avatar', fd, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       })
//       if (data?.avatarUrl) {
//         setForm(prev => ({ ...prev, avatarUrl: data.avatarUrl }))
//         if (typeof refreshUser === 'function') {
//           try { await refreshUser() } catch {}
//         }
//         alert('Avatar uploaded')
//       } else {
//         alert('Upload finished')
//       }
//     } catch (err) {
//       console.error('[Settings] avatar upload failed', err)
//       alert('Avatar upload failed')
//     } finally {
//       setAvatarUploading(false)
//       if (fileRef.current) fileRef.current.value = ''
//     }
//   }

//   async function onRemoveAvatar() {
//     if (!confirm('Remove avatar?')) return
//     try {
//       await api.delete('/users/me/avatar')
//       setForm(prev => ({ ...prev, avatarUrl: '' }))
//       if (typeof refreshUser === 'function') {
//         try { await refreshUser() } catch {}
//       }
//       alert('Avatar removed')
//     } catch (err) {
//       console.error('[Settings] remove avatar failed', err)
//       alert('Failed to remove avatar')
//     }
//   }

//   async function onRevokeSessions() {
//     if (!confirm('Revoke other sessions? This will require re-login on other devices.')) return
//     setRevokeMsg('')
//     try {
//       await settingsApi.revokeSessions()
//       setRevokeMsg('Sessions revoked.')
//       setTimeout(()=>setRevokeMsg(''),3000)
//     } catch (err) {
//       console.error('[Settings] revoke sessions failed', err)
//       setRevokeMsg('Failed to revoke sessions')
//     }
//   }

//   async function onTestNotification() {
//     try {
//       const res = await settingsApi.test()
//       if (res?.ok) alert('Test notification triggered on server (activity recorded).')
//       else alert('Test triggered (server did not confirm).')
//     } catch (err) {
//       console.error('[Settings] test notification failed', err)
//       alert('Failed to trigger test notification')
//     }
//   }

//   if (loading) return <div className="p-8">Loading settings…</div>

//   return (
//     // root wrapper: deep navy diagonal gradient like the screenshot
//     <div
//       className="min-h-screen"
//       style={{
//         background:
//           'linear-gradient(180deg, rgba(2,10,17,1) 0%, rgba(6,14,23,1) 40%, rgba(8,12,22,1) 100%)'
//       }}
//     >
//       {/* small CSS overrides to match the frosted-card + teal accent aesthetic */}
//       <style>{`
//         /* custom card look similar to the image: deep, slightly bluish frosted cards */
//         .frost-card {
//           background: linear-gradient(180deg, rgba(12,17,24,0.62), rgba(8,12,20,0.62));
//           border: 1px solid rgba(44,54,66,0.5);
//         }
//         /* subtle inset shadow for depth */
//         .card-shadow {
//           box-shadow: 0 6px 18px rgba(3,8,14,0.65), inset 0 1px 0 rgba(255,255,255,0.02);
//         }
//         /* inputs slightly darker and with soft outer glow on focus */
//         .input-deep:focus {
//           box-shadow: 0 0 0 6px rgba(6,182,212,0.06);
//         }
//         /* accent button gradient */
//         .accent-btn {
//           background: linear-gradient(90deg,#06b6d4 0%, #0ea5b7 40%, #00a3ff 100%);
//         }
//         /* warm highlight used for small date-like badges in the screenshot */
//         .warm-highlight {
//           color: #f59e0b;
//         }
//       `}</style>

//       <div className="max-w-5xl mx-auto p-6">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl lg:text-3xl font-semibold text-white">Settings</h1>
//             <p className="text-sm text-slate-400">Manage account, security, notifications and appearance</p>
//           </div>
//         </div>

//         <form onSubmit={onSave} className="space-y-6">
//           {/* Account */}
//           <section className="frost-card card-shadow p-6 rounded-xl">
//             <h2 className="font-semibold mb-4 text-xl text-slate-200">Account</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//               <div className="md:col-span-2 space-y-3">
//                 <label className="text-sm font-medium text-slate-300">Username (editable)</label>
//                 <input
//                   value={form.username}
//                   onChange={e => update('username', e.target.value)}
//                   className="w-full rounded-lg bg-[#07101a] border border-slate-700 text-white px-4 py-3 text-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400/30 input-deep"
//                 />

//                 <label className="text-sm font-medium text-slate-300 block mt-4">Email (read-only)</label>
//                 <input value={form.email} readOnly className="w-full rounded-lg bg-[#07101a] border border-slate-700 text-slate-400 px-4 py-3" />

//                 <div className="flex items-center gap-3 mt-4">
//                   <label className="rounded-lg accent-btn text-white px-4 py-2 cursor-pointer font-medium shadow transition-all">
//                     {avatarUploading ? 'Uploading…' : 'Change avatar'}
//                     <input ref={fileRef} type="file" accept="image/*" onChange={onUploadAvatar} className="hidden" />
//                   </label>
//                   <button type="button" onClick={onRemoveAvatar} className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-900/30 transition-all">Remove avatar</button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       if (confirm('Sign out from this device? (This will log you out)')) {
//                         alert('Local sign out not implemented here. Use profile menu to sign out.');
//                       }
//                     }}
//                     className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-900/30 transition-all"
//                   >
//                     Sign out (this browser)
//                   </button>
//                 </div>

//                 <div className="text-sm text-slate-400 mt-3">Signed in as <span className="font-medium text-slate-200">{user?.name || user?.email}</span></div>
//               </div>

//               <div className="flex items-center justify-center">
//                 {form.avatarUrl ? (
//                   <img src={form.avatarUrl} alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-xl" />
//                 ) : (
//                   <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-slate-700">
//                     {form.username ? form.username.charAt(0).toUpperCase() : (form.email || 'U').charAt(0).toUpperCase()}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </section>

//           {/* Security */}
//           <section className="frost-card card-shadow p-6 rounded-xl">
//             <h2 className="font-semibold mb-4 text-xl text-slate-200">Security</h2>
//             <div className="space-y-3">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
//                 <div>
//                   <label className="text-sm font-medium text-slate-300">Current password</label>
//                   <input autoComplete="current-password" type="password" value={pwState.currentPassword} onChange={e=>setPwState(s=>({...s,currentPassword:e.target.value}))} className="w-full rounded-lg bg-[#07101a] border border-slate-700 text-white px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400/30 input-deep" />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-slate-300">New password</label>
//                   <input autoComplete="new-password" type="password" value={pwState.newPassword} onChange={e=>setPwState(s=>({...s,newPassword:e.target.value}))} className="w-full rounded-lg bg-[#07101a] border border-slate-700 text-white px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400/30 input-deep" />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-slate-300">Confirm</label>
//                   <input autoComplete="new-password" type="password" value={pwState.confirm} onChange={e=>setPwState(s=>({...s,confirm:e.target.value}))} className="w-full rounded-lg bg-[#07101a] border border-slate-700 text-white px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400/30 input-deep" />
//                   <div className="mt-2">
//                     <button type="button" onClick={onChangePassword} className="rounded-lg accent-btn text-white px-4 py-2 font-medium shadow transition-all">Change password</button>
//                   </div>
//                   {pwMsg && <div className="text-sm text-teal-300 mt-1 font-medium">{pwMsg}</div>}
//                 </div>
//               </div>

//               <div className="flex items-center gap-3 mt-4 p-3 bg-[#05101a] rounded-lg border border-slate-700">
//                 <label className="text-sm text-slate-300 font-medium">Enable 2-factor (placeholder)</label>
//                 <input type="checkbox" checked={false} readOnly className="ml-auto w-5 h-5" />
//               </div>

//               <div className="flex items-center gap-3 mt-3">
//                 <button type="button" onClick={onRevokeSessions} className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-900/30 font-medium transition-all">Sign out everywhere</button>
//                 {revokeMsg && <div className="text-sm text-green-400 font-medium">{revokeMsg}</div>}
//               </div>
//             </div>
//           </section>

//           {/* Notifications */}
//           <section className="frost-card card-shadow p-6 rounded-xl">
//             <h2 className="font-semibold mb-4 text-xl text-slate-200">Notifications & reminders</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
//               <div className="p-3 bg-[#05121a] rounded-lg border border-slate-700">
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Email notifications</label>
//                 <div className="mt-1">
//                   <input type="checkbox" checked={form.emailEnabled} onChange={e=>update('emailEnabled', e.target.checked)} className="w-5 h-5" />
//                 </div>
//               </div>

//               <div className="p-3 bg-[#05121a] rounded-lg border border-slate-700">
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Push notifications</label>
//                 <div className="mt-1">
//                   <input type="checkbox" checked={form.pushEnabled} onChange={e=>update('pushEnabled', e.target.checked)} className="w-5 h-5" />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Reminder threshold (days)</label>
//                 <select value={form.reminderDays} onChange={e=>update('reminderDays', Number(e.target.value))} className="w-full rounded-lg bg-[#07101a] border border-slate-700 text-white px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400/30">
//                   {[1,3,7].map(n=> <option key={n} value={n}>{n} day(s)</option>)}
//                 </select>
//               </div>

//               <div className="md:col-span-3 mt-2">
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Digest schedule</label>
//                 <div className="flex items-center gap-3">
//                   <select value={form.digest} onChange={e=>update('digest', e.target.value)} className="rounded-lg bg-[#07101a] border border-slate-700 text-white px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400/30">
//                     <option value="off">Off</option>
//                     <option value="daily">Daily</option>
//                     <option value="weekly">Weekly</option>
//                   </select>
//                   <button type="button" onClick={onTestNotification} className="underline text-sm warm-highlight hover:text-yellow-400 font-medium">Test notification</button>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Appearance */}
//           <section className="frost-card card-shadow p-6 rounded-xl">
//             <h2 className="font-semibold mb-4 text-xl text-slate-200">Appearance</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
//               <div>
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Theme</label>
//                 <select value={form.theme} onChange={e=>update('theme', e.target.value)} className="w-full rounded-lg bg-[#07101a] border border-slate-700 text-white px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400/30">
//                   <option value="light">Light</option>
//                   <option value="dark">Dark</option>
//                   <option value="system">System</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Accent color</label>
//                 <div className="mt-1">
//                   <input type="color" value={form.accent} onChange={e=>update('accent', e.target.value)} className="w-16 h-12 p-1 rounded-lg border-2 border-slate-700 bg-[#07101a] cursor-pointer" />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Layout density</label>
//                 <div className="mt-1">
//                   <select value={form.compact ? 'compact' : 'spacious'} onChange={e=>update('compact', e.target.value === 'compact')} className="rounded-lg bg-[#07101a] border border-slate-700 text-white px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400/30">
//                     <option value="spacious">Spacious</option>
//                     <option value="compact">Compact</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </section>

//           <div className="flex items-center gap-3">
//             <button type="submit" disabled={saving} className="rounded-lg px-6 py-3 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed accent-btn text-white">
//               {saving ? 'Saving…' : 'Save changes'}
//             </button>
//             <div className="text-sm text-green-400 font-medium">{msg}</div>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// // }
// import { useEffect, useState, useRef } from 'react'
// import { useAuth } from '../context/AuthContext.jsx'
// import api from '../utils/api.js'
// import settingsApi from '../utils/settingsApi.js'

// export default function Settings() {
//   const { user, refreshUser } = useAuth()
//   const [loading, setLoading] = useState(true)

//   // Removed theme/accent/compact from frontend state per your request
//   const [form, setForm] = useState({
//     username: '',
//     email: '',
//     avatarUrl: '',
//     emailEnabled: true,
//     pushEnabled: true,
//     reminderDays: 3,
//     digest: 'weekly'
//   })

//   const [saving, setSaving] = useState(false)
//   const [msg, setMsg] = useState('')
//   const [pwState, setPwState] = useState({ currentPassword: '', newPassword: '', confirm: '' })
//   const [pwMsg, setPwMsg] = useState('')
//   const [avatarUploading, setAvatarUploading] = useState(false)
//   const fileRef = useRef(null)
//   const [revokeMsg, setRevokeMsg] = useState('')

//   useEffect(() => {
//     let mounted = true
//     ;(async () => {
//       try {
//         setLoading(true)
//         const data = await settingsApi.get()
//         if (!mounted) return

//         if (data) {
//           // No appearance fields read anymore
//           setForm(prev => ({
//             ...prev,
//             username: data.name ?? prev.username,
//             email: data.email ?? prev.email,
//             avatarUrl: data.avatarUrl ?? prev.avatarUrl,
//             emailEnabled: data.notificationPrefs?.emailEnabled ?? prev.emailEnabled,
//             pushEnabled: data.notificationPrefs?.pushEnabled ?? prev.pushEnabled,
//             reminderDays: data.notificationPrefs?.reminderDays ?? prev.reminderDays,
//             digest: data.notificationPrefs?.digest ?? prev.digest
//           }))
//         } else {
//           setForm(prev => ({
//             ...prev,
//             username: user?.name || '',
//             email: user?.email || ''
//           }))
//         }
//       } catch (e) {
//         setForm(prev => ({
//           ...prev,
//           username: user?.name || '',
//           email: user?.email || ''
//         }))
//       } finally {
//         if (mounted) setLoading(false)
//       }
//     })()
//     return () => { mounted = false }
//   }, [user])

//   function update(k, v) {
//     setForm(prev => ({ ...prev, [k]: v }))
//   }

//   async function onSave(e) {
//     e?.preventDefault()
//     if (saving) return
//     setSaving(true); setMsg('')
//     try {
//       // Removed appearance fields from payload
//       const payload = {
//         name: form.username,
//         notificationPrefs: {
//           emailEnabled: !!form.emailEnabled,
//           pushEnabled: !!form.pushEnabled,
//           reminderDays: Number(form.reminderDays),
//           digest: form.digest
//         }
//       }

//       const updated = await settingsApi.update(payload)

//       if (typeof refreshUser === 'function') {
//         try { await refreshUser() } catch (e) { /* ignore */ }
//       }

//       if (updated) {
//         setForm(prev => ({
//           ...prev,
//           username: updated.name ?? prev.username,
//           email: updated.email ?? prev.email,
//           avatarUrl: updated.avatarUrl ?? prev.avatarUrl,
//           emailEnabled: updated.notificationPrefs?.emailEnabled ?? prev.emailEnabled,
//           pushEnabled: updated.notificationPrefs?.pushEnabled ?? prev.pushEnabled,
//           reminderDays: updated.notificationPrefs?.reminderDays ?? prev.reminderDays,
//           digest: updated.notificationPrefs?.digest ?? prev.digest
//         }))
//       }

//       setMsg('Settings saved.')
//     } catch (err) {
//       console.error('[Settings] save failed', err)
//       setMsg('Failed to save.')
//     } finally {
//       setSaving(false)
//       setTimeout(() => setMsg(''), 3000)
//     }
//   }

//   async function onChangePassword() {
//     setPwMsg('')
//     if (!pwState.currentPassword || !pwState.newPassword) {
//       setPwMsg('Fill both fields')
//       return
//     }
//     if (pwState.newPassword !== pwState.confirm) {
//       setPwMsg('New password and confirm do not match')
//       return
//     }
//     try {
//       await api.put('/users/me/password', {
//         currentPassword: pwState.currentPassword,
//         newPassword: pwState.newPassword
//       })
//       setPwState({ currentPassword: '', newPassword: '', confirm: '' })
//       setPwMsg('Password changed.')
//       setTimeout(()=>setPwMsg(''), 3000)
//     } catch (err) {
//       console.error('[Settings] change password failed', err)
//       setPwMsg(err?.response?.data?.error || 'Failed to change password')
//     }
//   }

//   async function onUploadAvatar(e) {
//     const file = e?.target?.files?.[0]
//     if (!file) return
//     const allowed = ['image/png','image/jpeg','image/jpg','image/webp']
//     if (!allowed.includes(file.type)) {
//       alert('Use PNG/JPG/WebP image')
//       return
//     }
//     const fd = new FormData()
//     fd.append('avatar', file)
//     try {
//       setAvatarUploading(true)
//       const { data } = await api.post('/users/me/avatar', fd, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       })
//       if (data?.avatarUrl) {
//         setForm(prev => ({ ...prev, avatarUrl: data.avatarUrl }))
//         if (typeof refreshUser === 'function') {
//           try { await refreshUser() } catch {}
//         }
//         alert('Avatar uploaded')
//       } else {
//         alert('Upload finished')
//       }
//     } catch (err) {
//       console.error('[Settings] avatar upload failed', err)
//       alert('Avatar upload failed')
//     } finally {
//       setAvatarUploading(false)
//       if (fileRef.current) fileRef.current.value = ''
//     }
//   }

//   async function onRemoveAvatar() {
//     if (!confirm('Remove avatar?')) return
//     try {
//       await api.delete('/users/me/avatar')
//       setForm(prev => ({ ...prev, avatarUrl: '' }))
//       if (typeof refreshUser === 'function') {
//         try { await refreshUser() } catch {}
//       }
//       alert('Avatar removed')
//     } catch (err) {
//       console.error('[Settings] remove avatar failed', err)
//       alert('Failed to remove avatar')
//     }
//   }

//   async function onRevokeSessions() {
//     if (!confirm('Revoke other sessions? This will require re-login on other devices.')) return
//     setRevokeMsg('')
//     try {
//       await settingsApi.revokeSessions()
//       setRevokeMsg('Sessions revoked.')
//       setTimeout(()=>setRevokeMsg(''),3000)
//     } catch (err) {
//       console.error('[Settings] revoke sessions failed', err)
//       setRevokeMsg('Failed to revoke sessions')
//     }
//   }

//   async function onTestNotification() {
//     try {
//       const res = await settingsApi.test()
//       if (res?.ok) alert('Test notification triggered on server (activity recorded).')
//       else alert('Test triggered (server did not confirm).')
//     } catch (err) {
//       console.error('[Settings] test notification failed', err)
//       alert('Failed to trigger test notification')
//     }
//   }

//   if (loading) return <div className="p-8">Loading settings…</div>

//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background:
//           'linear-gradient(180deg, rgba(2,10,17,1) 0%, rgba(6,14,23,1) 40%, rgba(8,12,22,1) 100%)'
//       }}
//     >
//       <style>{`
//         /* page styling */
//         .frost-card {
//           background: linear-gradient(180deg, rgba(12,17,24,0.62), rgba(8,12,20,0.62));
//           border: 1px solid rgba(44,54,66,0.5);
//         }
//         .card-shadow { box-shadow: 0 6px 18px rgba(3,8,14,0.65), inset 0 1px 0 rgba(255,255,255,0.02); }
//         .input-deep:focus { box-shadow: 0 0 0 6px rgba(6,182,212,0.06); }
//         .accent-btn { background: linear-gradient(90deg,#06b6d4 0%, #0ea5b7 40%, #00a3ff 100%); }
//         .warm-highlight { color: #f59e0b; }

//         /* title gradient like your Add Item screenshot */
//         .page-title {
//           font-weight: 700;
//           font-size: 2.5rem;
//           line-height: 1.05;
//           background: linear-gradient(90deg, #10b981, #06b6d4, #3b82f6);
//           -webkit-background-clip: text;
//           background-clip: text;
//           -webkit-text-fill-color: transparent;
//         }
//         .page-sub {
//           color: rgba(148,163,184,0.9); /* bluish gray */
//         }

//         /* button defaults and hover "blink" animation */
//         .btn {
//           border-radius: 0.5rem;
//           padding: 0.6rem 1rem;
//           cursor: pointer;
//           transition: transform 120ms ease, box-shadow 120ms ease;
//           box-shadow: 0 6px 14px rgba(2,6,12,0.45);
//         }
//         .btn-outline {
//           background: transparent;
//           border: 1px solid rgba(107,114,128,0.18);
//           color: #d1d5db;
//         }
//         .btn-primary {
//           color: white;
//           background: linear-gradient(90deg,#06b6d4 0%, #0ea5b7 40%);
//           border: none;
//         }

//         @keyframes blink {
//           0% { transform: translateY(0); filter: brightness(1); }
//           50% { transform: translateY(-3px); filter: brightness(1.18); }
//           100% { transform: translateY(0); filter: brightness(1); }
//         }

//         /* apply animation while hovered */
//         .btn:hover {
//           animation: blink 650ms linear infinite;
//         }

//         /* security grid - ensure top alignment and consistent input heights */
//         .security-grid { align-items: start; }
//         .security-input { height: 3rem; min-height: 3rem; }

//         /* ensure selects/inputs look consistent */
//         .deep-input {
//           background: #07101a;
//           border: 1px solid rgba(67,84,97,0.28);
//           color: #e6eef6;
//         }
//       `}</style>

//       <div className="max-w-5xl mx-auto p-6">
//         <div className="mb-6">
//           <h1 className="page-title">Settings</h1>
//           <p className="page-sub mt-2">Manage account, security, notifications and appearance</p>
//         </div>

//         <form onSubmit={onSave} className="space-y-6">
//           {/* Account */}
//           <section className="frost-card card-shadow p-6 rounded-xl">
//             <h2 className="font-semibold mb-4 text-xl text-slate-200">Account</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//               <div className="md:col-span-2 space-y-3">
//                 <label className="text-sm font-medium text-slate-300">Username (editable)</label>
//                 <input
//                   value={form.username}
//                   onChange={e => update('username', e.target.value)}
//                   className="w-full rounded-lg deep-input px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-teal-400/30 input-deep"
//                 />

//                 <label className="text-sm font-medium text-slate-300 block mt-4">Email (read-only)</label>
//                 <input value={form.email} readOnly className="w-full rounded-lg deep-input px-4 py-3 text-slate-300" />

//                 <div className="flex items-center gap-3 mt-4">
//                   <label className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
//                     {avatarUploading ? 'Uploading…' : 'Change avatar'}
//                     <input ref={fileRef} type="file" accept="image/*" onChange={onUploadAvatar} className="hidden" />
//                   </label>

//                   <button type="button" onClick={onRemoveAvatar} className="btn btn-outline">Remove avatar</button>

//                   <button
//                     type="button"
//                     onClick={() => {
//                       if (confirm('Sign out from this device? (This will log you out)')) {
//                         alert('Local sign out not implemented here. Use profile menu to sign out.');
//                       }
//                     }}
//                     className="btn btn-outline"
//                   >
//                     Sign out (this browser)
//                   </button>
//                 </div>

//                 <div className="text-sm text-slate-400 mt-3">Signed in as <span className="font-medium text-slate-200">{user?.name || user?.email}</span></div>
//               </div>

//               <div className="flex items-center justify-center">
//                 {form.avatarUrl ? (
//                   <img src={form.avatarUrl} alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-xl" />
//                 ) : (
//                   <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-slate-700">
//                     {form.username ? form.username.charAt(0).toUpperCase() : (form.email || 'U').charAt(0).toUpperCase()}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </section>

//           {/* Security */}
//           <section className="frost-card card-shadow p-6 rounded-xl">
//             <h2 className="font-semibold mb-4 text-xl text-slate-200">Security</h2>

//             {/* We use a grid with top alignment to ensure consistent alignment */}
//             <div className="grid grid-cols-1 md:grid-cols-12 gap-3 security-grid">
//               <div className="md:col-span-4">
//                 <label className="text-sm font-medium text-slate-300">Current password</label>
//                 <input
//                   autoComplete="current-password"
//                   type="password"
//                   value={pwState.currentPassword}
//                   onChange={e=>setPwState(s=>({...s,currentPassword:e.target.value}))}
//                   className="w-full rounded-lg deep-input px-4 py-2 security-input focus:outline-none focus:ring-2 focus:ring-teal-400/30"
//                 />
//               </div>

//               <div className="md:col-span-4">
//                 <label className="text-sm font-medium text-slate-300">New password</label>
//                 <input
//                   autoComplete="new-password"
//                   type="password"
//                   value={pwState.newPassword}
//                   onChange={e=>setPwState(s=>({...s,newPassword:e.target.value}))}
//                   className="w-full rounded-lg deep-input px-4 py-2 security-input focus:outline-none focus:ring-2 focus:ring-teal-400/30"
//                 />
//               </div>

//               <div className="md:col-span-4">
//                 <label className="text-sm font-medium text-slate-300">Confirm</label>
//                 <div className="flex items-start gap-3">
//                   <input
//                     autoComplete="new-password"
//                     type="password"
//                     value={pwState.confirm}
//                     onChange={e=>setPwState(s=>({...s,confirm:e.target.value}))}
//                     className="w-full rounded-lg deep-input px-4 py-2 security-input focus:outline-none focus:ring-2 focus:ring-teal-400/30"
//                   />
//                   <div style={{ minWidth: '10.5rem' }}>
//                     <button type="button" onClick={onChangePassword} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
//                       Change password
//                     </button>
//                   </div>
//                 </div>

//                 {pwMsg && <div className="text-sm text-teal-300 mt-3 font-medium">{pwMsg}</div>}
//               </div>
//             </div>

//             <div className="mt-4 p-3 bg-[#05121a] rounded-lg border border-slate-700 flex items-center justify-between">
//               <div className="text-sm text-slate-300 font-medium">Enable 2-factor (placeholder)</div>
//               <input type="checkbox" checked={false} readOnly className="w-5 h-5" />
//             </div>

//             <div className="mt-4">
//               <button type="button" onClick={onRevokeSessions} className="btn btn-outline">Sign out everywhere</button>
//               {revokeMsg && <div className="text-sm text-green-400 inline-block ml-4 font-medium">{revokeMsg}</div>}
//             </div>
//           </section>

//           {/* Notifications */}
//           <section className="frost-card card-shadow p-6 rounded-xl">
//             <h2 className="font-semibold mb-4 text-xl text-slate-200">Notifications & reminders</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
//               <div className="p-3 bg-[#05121a] rounded-lg border border-slate-700">
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Email notifications</label>
//                 <div className="mt-1">
//                   <input type="checkbox" checked={form.emailEnabled} onChange={e=>update('emailEnabled', e.target.checked)} className="w-5 h-5" />
//                 </div>
//               </div>

//               <div className="p-3 bg-[#05121a] rounded-lg border border-slate-700">
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Push notifications</label>
//                 <div className="mt-1">
//                   <input type="checkbox" checked={form.pushEnabled} onChange={e=>update('pushEnabled', e.target.checked)} className="w-5 h-5" />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Reminder threshold (days)</label>
//                 <select value={form.reminderDays} onChange={e=>update('reminderDays', Number(e.target.value))} className="w-full rounded-lg deep-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400/30">
//                   {[1,3,7].map(n=> <option key={n} value={n}>{n} day(s)</option>)}
//                 </select>
//               </div>

//               <div className="md:col-span-3 mt-2">
//                 <label className="text-sm font-medium text-slate-300 block mb-2">Digest schedule</label>
//                 <div className="flex items-center gap-3">
//                   <select value={form.digest} onChange={e=>update('digest', e.target.value)} className="rounded-lg deep-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400/30">
//                     <option value="off">Off</option>
//                     <option value="daily">Daily</option>
//                     <option value="weekly">Weekly</option>
//                   </select>
//                   <button type="button" onClick={onTestNotification} className="btn btn-outline">Test notification</button>
//                 </div>
//               </div>
//             </div>
//           </section>

//           <div className="flex items-center gap-3">
//             <button type="submit" disabled={saving} className="btn btn-primary" style={{ paddingLeft: '1.4rem', paddingRight: '1.4rem' }}>
//               {saving ? 'Saving…' : 'Save changes'}
//             </button>
//             <div className="text-sm text-green-400 font-medium">{msg}</div>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'
import settingsApi from '../utils/settingsApi.js'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)

  // Appearance removed (frontend no longer sends/receives theme/accent/layout)
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
      // Remove appearance fields from payload (backend will retain whatever it has)
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

      // Intentionally NOT calling refreshUser() here to avoid overwriting / changing
      // any global UI avatar/accent state that might be stored elsewhere and cause
      // the header/avatar color to change unexpectedly when the user clicks Save.
      //
      // Avatar/upload handlers below still call refreshUser so avatar changes
      // from uploading/removing remain supported.

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
        /* frosted cards + depth */
        .frost-card {
          background: linear-gradient(180deg, rgba(12,17,24,0.62), rgba(8,12,20,0.62));
          border: 1px solid rgba(44,54,66,0.5);
        }
        .card-shadow { box-shadow: 0 6px 18px rgba(3,8,14,0.65), inset 0 1px 0 rgba(255,255,255,0.02); }

        /* Settings heading: reduced thickness to match your Dashboard heading */
        .page-title {
          font-weight: 600; /* reduced thickness from 800 -> 600 */
          font-size: 2.4rem; /* slightly smaller */
          line-height: 1.05;
          color: #06b6d4; /* same cyan/teal color you approved */
        }
        .page-sub {
          color: rgba(148,163,184,0.9);
        }

        /* inputs/selects - dark with teal focus border/glow */
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

        /* select styling */
        select.deep-input {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding-right: 2.25rem;
          background-image:
            linear-gradient(45deg, transparent 50%, rgba(255,255,255,0.14) 50%),
            linear-gradient(135deg, rgba(255,255,255,0.14) 50%, transparent 50%),
            linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.02));
          background-position:
            calc(100% - 18px) calc(1em + 2px),
            calc(100% - 13px) calc(1em + 2px),
            calc(100% - 2.5rem) 0.5rem;
          background-size: 6px 6px, 6px 6px, 1px 1.5rem;
          background-repeat: no-repeat;
        }

        /* button base, primary and outline */
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
          border: none;
        }

        /* blink animation on hover for all buttons */
        @keyframes blink {
          0% { transform: translateY(0); filter: brightness(1); }
          50% { transform: translateY(-3px); filter: brightness(1.16); }
          100% { transform: translateY(0); filter: brightness(1); }
        }
        .btn:hover {
          animation: blink 650ms linear infinite;
        }

        /* Security alignment tweaks */
        .security-grid { align-items: start; }
        .security-input { height: 3rem; min-height: 3rem; }

        /* Save button spacing: push down so dropdowns remain visible above it */
        .save-row { margin-top: 1.6rem; }

        /*
         Avatar: use a fixed blue circular background for initials (like the header),
         so it will not change color when settings are saved. If user uploads a real
         avatarUrl it will still render that image (no color-flash).
        */
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
          /* solid blue - matching header example (keeps consistent look) */
          background: radial-gradient(circle at 30% 25%, #2d6ee6 0%, #1f55d9 55%);
          box-shadow: 0 10px 22px rgba(22,45,88,0.55);
        }

        /* Option styling for selects (browser-limited) */
        select.deep-input option { background: #08121a; color: #e6eef6; }

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
                  <label className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                    {avatarUploading ? 'Uploading…' : 'Change avatar'}
                    <input ref={fileRef} type="file" accept="image/*" onChange={onUploadAvatar} className="hidden" />
                  </label>

                  <button type="button" onClick={onRemoveAvatar} className="btn btn-outline">Remove avatar</button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Sign out from this device? (This will log you out)')) {
                        alert('Local sign out not implemented here. Use profile menu to sign out.');
                      }
                    }}
                    className="btn btn-outline"
                  >
                    Sign out (this browser)
                  </button>
                </div>

                <div className="text-sm text-slate-400 mt-3">Signed in as <span className="font-medium text-slate-200">{user?.name || user?.email}</span></div>
              </div>

              <div className="flex items-center justify-center">
                {form.avatarUrl ? (
                  // if user has uploaded avatarUrl we still show that image
                  <img src={form.avatarUrl} alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-xl" />
                ) : (
                  // otherwise use a fixed-blue avatar circle (guaranteed to not become pink)
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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 security-grid">
              <div className="md:col-span-4">
                <label className="text-sm font-medium text-slate-300">Current password</label>
                <input
                  autoComplete="current-password"
                  type="password"
                  value={pwState.currentPassword}
                  onChange={e=>setPwState(s=>({...s,currentPassword:e.target.value}))}
                  className="w-full rounded-lg deep-input px-4 py-2 security-input"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-sm font-medium text-slate-300">New password</label>
                <input
                  autoComplete="new-password"
                  type="password"
                  value={pwState.newPassword}
                  onChange={e=>setPwState(s=>({...s,newPassword:e.target.value}))}
                  className="w-full rounded-lg deep-input px-4 py-2 security-input"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-sm font-medium text-slate-300">Confirm</label>
                <div className="flex items-start gap-3">
                  <input
                    autoComplete="new-password"
                    type="password"
                    value={pwState.confirm}
                    onChange={e=>setPwState(s=>({...s,confirm:e.target.value}))}
                    className="w-full rounded-lg deep-input px-4 py-2 security-input"
                  />
                  <div style={{ minWidth: '10.5rem', display: 'flex', alignItems: 'center' }}>
                    <button type="button" onClick={onChangePassword} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                      Change password
                    </button>
                  </div>
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
                <div className="mt-1">
                  <input type="checkbox" checked={form.emailEnabled} onChange={e=>update('emailEnabled', e.target.checked)} className="w-5 h-5" />
                </div>
              </div>

              <div className="p-3 bg-[#05121a] rounded-lg border border-slate-700">
                <label className="text-sm font-medium text-slate-300 block mb-2">Push notifications</label>
                <div className="mt-1">
                  <input type="checkbox" checked={form.pushEnabled} onChange={e=>update('pushEnabled', e.target.checked)} className="w-5 h-5" />
                </div>
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

          {/* Save row moved down a bit so dropdowns can open without overlap */}
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



