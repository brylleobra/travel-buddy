import { Router } from 'express';
import { Deal } from '@tripsmith/db';

const r = Router();

r.get('/', async (req, res, next) => {
  try {
    const deals = await Deal.find().sort({ score: -1, createdAt: -1 }).limit(50).lean();
    res.json(deals);
  } catch (e) {
    next(e);
  }
});

export default r;
