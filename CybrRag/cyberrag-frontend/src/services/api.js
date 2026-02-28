// src/services/api.js
import axios from 'axios';

// Use 127.0.0.1 instead of localhost
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add this to test the connection
api.interceptors.request.use(request => {
  console.log('📤 Request:', request.method.toUpperCase(), request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('📥 Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export const analyzeLog = async (logText) => {
  try {
    console.log('Analyzing log:', logText.substring(0, 50) + '...');
    const response = await api.post('/analysis/analyze', { log: logText });
    return response.data;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};

export const parseLog = async (logText) => {
  try {
    const response = await api.post('/logs/parse', { log: logText });
    return response.data;
  } catch (error) {
    console.error('Parse failed:', error);
    throw error;
  }
};

export const getMitreTechnique = async (techId) => {
  try {
    const response = await api.get(`/mitre/technique/${techId}`);
    return response.data;
  } catch (error) {
    console.error('MITRE fetch failed:', error);
    throw error;
  }
};

export default api;