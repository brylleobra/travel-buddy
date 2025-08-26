import { Router } from 'express';
import { Booking } from '@tripsmith/db';

const r = Router();

// Duffel webhook (simple example; verify signatures in production)
r.post('/duffel', async (req, res) => {
  const event = req.body;
  if (event?.type?.startsWith('order.')) {
    const order = event.data?.object;
    await Booking.updateOne(
      { provider: 'duffel', providerId: order?.id },
      { $set: { status: order?.status, raw: order } }
    );
  }
  res.sendStatus(200);
});

export default r;
