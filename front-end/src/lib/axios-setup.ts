import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const timeout = Number(import.meta.env.VITE_API_TIMEOUT);
axios.defaults.timeout = Number.isNaN(timeout) ? 10000 : timeout;
axios.defaults.headers.common['Content-Type'] = 'application/json';
