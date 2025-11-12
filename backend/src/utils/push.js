import webpush from 'web-push'

const pub = process.env.WEB_PUSH_PUBLIC_VAPID_KEY
const priv = process.env.WEB_PUSH_PRIVATE_VAPID_KEY
const contact = process.env.WEB_PUSH_CONTACT || 'mailto:example@example.com'

if (pub && priv) {
  webpush.setVapidDetails(contact, pub, priv)
}

// In-memory subscriptions for demo; store in DB in production
const subscriptions = []

export function addSubscription(sub) {
  subscriptions.push(sub)
}

export async function sendPushToAll(title, body) {
  if (!pub || !priv) return
  const payload = JSON.stringify({ title, body })
  await Promise.all(
    subscriptions.map((sub) => webpush.sendNotification(sub, payload).catch(() => {}))
  )
}
