import api from './api.js'

const BASE = '/users' // will be normalized by api.js -> becomes /api/users in requests

export default {
  // GET /api/users/me
  async get() {
    try {
      const { data } = await api.get(`${BASE}/me`)
      return data
    } catch (e) {
      console.error('settingsApi.get failed', e)
      return null
    }
  },

  // PUT /api/users/me
  async update(payload) {
    try {
      const { data } = await api.put(`${BASE}/me`, payload)
      return data
    } catch (err) {
      console.error('settingsApi.update failed', err)
      throw err
    }
  },

  // POST /api/users/me/test
  async test() {
    try {
      const { data } = await api.post(`${BASE}/me/test`)
      return data
    } catch (err) {
      console.error('settingsApi.test failed', err)
      throw err
    }
  },

  // POST /api/users/me/revoke-sessions
  async revokeSessions() {
    try {
      const { data } = await api.post(`${BASE}/me/revoke-sessions`)
      return data
    } catch (err) {
      console.error('settingsApi.revokeSessions failed', err)
      throw err
    }
  }
}
