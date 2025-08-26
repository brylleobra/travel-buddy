import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectMongo } from '@tripsmith/db';

import flights from './routes/flights.js';
import hotels from './routes/hotels.js';
import itinerary from './routes/itinerary.js';
import webhooks from './routes/webhooks.js';
import deals from './routes/deals.js';

await connectMongo();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '1.5mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/flights', flights);
app.use('/api/hotels', hotels);
app.use('/api/itinerary', itinerary);
app.use('/api/webhooks', webhooks);
app.use('/api/deals', deals);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
