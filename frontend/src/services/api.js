import axios from 'axios';

// Point to the root API
const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// 2. Response Interceptor (Handle Token Expiration and Refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 (Unauthorized) and it's NOT the refresh endpoint itself
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // If we are already refreshing, push subsequent failed requests to a queue
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      // Start the refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token available, force logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to get a new access token
        const refreshResponse = await axios.post(
          `${API_URL}authentication/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem('access_token', newAccessToken);

        // Update failed requests in the queue
        processQueue(null, newAccessToken);
        
        // Update the original request header and retry
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        isRefreshing = false;
        
        return axios(originalRequest);

      } catch (refreshError) {
        // Refresh token failed (it's expired or invalid)
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Default error handling
    return Promise.reject(error);
  }
);

export default api;