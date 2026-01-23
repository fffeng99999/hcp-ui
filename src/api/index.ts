import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080/api',
  timeout: 5000,
});

instance.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err),
);

export default instance;
