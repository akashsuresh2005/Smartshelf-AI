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





// // export default api;
// // src/utils/api.js
// import axios from 'axios';

// const ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: ROOT,
//   withCredentials: true,
//   timeout: 20000
// });

// function normalizePath(baseURL, url) {
//   if (!url || typeof url !== 'string') return url;
//   if (/^https?:\/\//i.test(url)) return url;
//   let u = url.replace(/^\/+/, '/');
//   const baseEndsWithApi = typeof baseURL === 'string' && /\/api\/?$/.test(baseURL);
//   if (baseEndsWithApi && /^\/?api(\/|$)/i.test(u)) u = u.replace(/^\/?api(\/|$)/i, '/');
//   if (!u.startsWith('/')) u = `/${u}`;
//   return u;
// }

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   config.url = normalizePath(api.defaults.baseURL, config.url);
//   return config;
// });

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const status = err?.response?.status;
//     if (status === 401) {
//       localStorage.removeItem('token');
//       if (window.location.pathname !== '/login') {
//         window.location.replace('/login');
//       }
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;



// src/utils/api.js
import axios from 'axios';

const ROOT =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ------------------------------------------------------------
//  Axios instance
// ------------------------------------------------------------
const api = axios.create({
  baseURL: ROOT,
  withCredentials: true,
  timeout: 20000
});

// ------------------------------------------------------------
//  Path Normalizer
//  Ensures you don't get duplicated /api/api
// ------------------------------------------------------------
function normalizePath(baseURL, url) {
  if (!url || typeof url !== 'string') return url;

  // Allow full URLs
  if (/^https?:\/\//i.test(url)) return url;

  let u = url.replace(/^\/+/, '/');

  // Remove duplicate /api when baseURL already ends with /api
  const baseEndsWithApi =
    typeof baseURL === 'string' && /\/api\/?$/.test(baseURL);

  if (baseEndsWithApi && /^\/?api(\/|$)/i.test(u)) {
    u = u.replace(/^\/?api(\/|$)/i, '/');
  }

  if (!u.startsWith('/')) u = `/${u}`;

  return u;
}

// ------------------------------------------------------------
//  Request Interceptor (SAFE)
//  • Attaches token if available (defensive)
//  • Normalizes path
// ------------------------------------------------------------
api.interceptors.request.use((cfg) => {
  // Defensive: ensure we always return a config object
  let config = cfg || {};

  try {
    // Safe localStorage read (some extensions or environments may throw)
    let token = null;
    try {
      token = typeof window !== 'undefined' && window?.localStorage?.getItem
        ? window.localStorage.getItem('token')
        : null;
    } catch (e) {
      console.warn('[api] localStorage unavailable', e);
      token = null;
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Normalize the URL path if helper exists
    try {
      config.url = normalizePath(api.defaults.baseURL, config.url);
    } catch (e) {
      // ignore normalization errors
    }
  } catch (err) {
    console.error('[api interceptor] unexpected error', err);
  }

  return config;
});

// ------------------------------------------------------------
//  Response Interceptor
//  • Returns plain TEXT for chatbot responses
//  • Returns JSON normally for other APIs
//  • Handles 401 (auto logout)
// ------------------------------------------------------------
api.interceptors.response.use(
  (res) => {
    const contentType = res.headers['content-type'];

    // Chatbot responses → text/plain
    if (contentType && contentType.includes('text/plain')) {
      return res.data; // return formatted text
    }

    // Normal JSON
    return res.data;
  },
  (err) => {
    const status = err?.response?.status;

    // Auto logout on 401
    if (status === 401) {
      try { localStorage.removeItem('token'); } catch (e) {}
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(err);
  }
);

export default api;
