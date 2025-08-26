import axios from 'axios';

export const duffel = axios.create({
  baseURL: 'https://api.duffel.com/air',
  headers: {
    Authorization: `Bearer ${process.env.DUFFEL_TOKEN}`,
    'Duffel-Version': 'v1',
    'Content-Type': 'application/json'
  },
  timeout: 30000
});
