import axios from 'axios';
import { JAMIE_API_BASE_URL } from '../constants';

const publicAPI = axios.create({
  baseURL: JAMIE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { publicAPI };
