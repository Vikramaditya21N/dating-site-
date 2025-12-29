// src/Config.ts
export const API_BASE_URL = 
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000' 
    : 'https://your-wink-backend.onrender.com'; // Replace this later with your real deployment URL