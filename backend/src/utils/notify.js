import User from '../models/User.js';

/**
 * Always return the correct user's email – even if req.user.email is missing.
 */
export async function getRecipientEmail(req) {
  if (req.user?.email) return req.user.email;

  const user = await User.findById(req.user.id).select('email');
  return user?.email || null;
}
