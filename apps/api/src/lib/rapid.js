import axios from 'axios';

// NOTE: Replace baseURL & payloads with the latest Rapid endpoints per your contract.
export const rapid = axios.create({
  baseURL: 'https://test.ean.com/2.4',
  headers: {
    Accept: 'application/json',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/json',
    apikey: process.env.RAPID_KEY,
    'partner-correlation-id': process.env.RAPID_CID || 'correlation-id',
    'customer-session-id': 'session-xyz'
  },
  timeout: 30000
});
