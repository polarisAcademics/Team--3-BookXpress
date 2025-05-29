import axios from 'axios';
import { authConfig } from '../config/auth.config';

const api = axios.create({
  baseURL: authConfig.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const sendTicket = async (email, ticketDetails) => {
  try {
    const response = await api.post('/api/tickets/send-ticket', { email, ticketDetails });
    return response.data;
  } catch (error) {
    console.error('Error sending ticket:', error);
    throw new Error(error.response?.data?.message || 'Failed to send ticket');
  }
};