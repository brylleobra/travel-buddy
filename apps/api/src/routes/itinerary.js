import { Router } from 'express';
import { Deal } from '@tripsmith/db';
import { ollamaChat } from '../lib/ollama.js';

const r = Router();

r.post('/generate', async (req, res, next) => {
  try {
    const { trip, preferences } = req.body;
    const topDeals = await Deal.find().sort({ score: -1 }).limit(8).lean();

    const system = `You are a meticulous travel planner. Create a day-by-day plan.
- Balance activities and rest.
- Embed any references to deals using [S:<id>] if relevant.
- Output JSON only: { title, days: [{date, items:[{time, title, details, cost?}]}] }`;

    const user = { trip, preferences, topDeals };

    const data = await ollamaChat([
      { role: 'system', content: system },
      { role: 'user', content: JSON.stringify(user) }
    ]);

    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default r;
