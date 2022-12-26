import axios from 'axios';

const publicAPI = axios.create({
  baseURL: process.env.JAMIE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { publicAPI };
