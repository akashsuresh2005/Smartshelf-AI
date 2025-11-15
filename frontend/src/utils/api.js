// // import axios from 'axios'

// // // Make sure VITE_API_BASE_URL is set in your frontend .env file like:
// // // VITE_API_BASE_URL=http://localhost:5000/api
// // const api = axios.create({
// //   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
// // })

// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem('token')
// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token}`
// //   }
// //   return config
// // })

// // api.interceptors.response.use(
// //   (res) => res,
// //   (err) => {
// //     // Optionally handle 401 errors globally
// //     return Promise.reject(err)
// //   }
// // )

// // export default api
// // src/utils/api.js
// import axios from 'axios';

// /**
//  * BASE URL
//  * - Dev default: http://localhost:5000/api
//  * - Prod: set VITE_API_BASE_URL (e.g., https://api.example.com/api)
//  */
// const ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: ROOT,
//   withCredentials: true,
//   timeout: 20000
// });

// /**
//  * Normalize relative request URLs so we never end up with /api/api/...
//  * If baseURL ends with /api and the requested path also starts with /api,
//  * strip the extra leading /api from the path.
//  */
// function normalizePath(baseURL, url) {
//   if (!url || typeof url !== 'string') return url;

//   // absolute URLs should be left alone
//   if (/^https?:\/\//i.test(url)) return url;

//   let u = url;

//   // Remove duplicate leading slashes
//   u = u.replace(/^\/+/, '/');

//   // If baseURL ends with /api and path starts with /api, strip the first /api
//   const baseEndsWithApi = typeof baseURL === 'string' && /\/api\/?$/.test(baseURL);
//   if (baseEndsWithApi && /^\/?api(\/|$)/i.test(u)) {
//     // ✅ THIS fixes the double /api issue
//     u = u.replace(/^\/?api(\/|$)/i, '/');
//   }

//   // Ensure it starts with a single slash
//   if (!u.startsWith('/')) u = `/${u}`;

//   return u;
// }

// /** Attach token + normalize path before every request */
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   // ✅ **THIS IS THE LINE I ADDED**
//   config.url = normalizePath(api.defaults.baseURL, config.url);

//   return config;
// });

// /** Handle responses / errors globally */
// api.interceptors.response.use(
//   (res) => res,
//   (err) => Promise.reject(err)
// );

// export default api;
import axios from 'axios';

const ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: ROOT,
  withCredentials: true,
  timeout: 20000
});

function normalizePath(baseURL, url) {
  if (!url || typeof url !== 'string') return url;
  if (/^https?:\/\//i.test(url)) return url;
  let u = url.replace(/^\/+/, '/');
  const baseEndsWithApi = typeof baseURL === 'string' && /\/api\/?$/.test(baseURL);
  if (baseEndsWithApi && /^\/?api(\/|$)/i.test(u)) u = u.replace(/^\/?api(\/|$)/i, '/');
  if (!u.startsWith('/')) u = `/${u}`;
  return u;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.url = normalizePath(api.defaults.baseURL, config.url);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // remove bad/expired token and bounce to login
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;


