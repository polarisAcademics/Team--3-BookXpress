import axios from 'axios';
import { authConfig } from '../config/auth.config';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const trainsService = {
  async getTrainsBetweenStations(fromStation, toStation, date) {
    try {
      const response = await api.get('/api/trains-between-stations', {
        params: {
          fromStation,
          toStation,
          date
        }
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch trains');
    }
  }
}; 