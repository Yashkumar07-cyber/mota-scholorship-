import axios from 'axios';

export const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mota_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Friendly error mapping
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'The scholarship portal encountered a temporary delay. Please try again.';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (data && data.message) {
        friendlyMessage = data.message;
      } else if (status === 401) {
        friendlyMessage = 'Your session has expired. Please log in again with OTP or password.';
        localStorage.removeItem('mota_auth_token');
        localStorage.removeItem('mota_user');
      } else if (status === 403) {
        friendlyMessage = 'You do not have administrative authorization for this section.';
      } else if (status === 404) {
        friendlyMessage = 'The requested scholarship or application record could not be found.';
      } else if (status >= 500) {
        friendlyMessage = 'Verification service is temporarily unavailable. Please retry in a moment.';
      }
    } else if (error.request) {
      friendlyMessage = 'Network connection issue. Please check your internet or retry.';
    }

    return Promise.reject(new Error(friendlyMessage));
  }
);

export default api;
