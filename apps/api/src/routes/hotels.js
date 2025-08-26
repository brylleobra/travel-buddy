import { Router } from 'express';
import { rapid } from '../lib/rapid.js';
import { PriceSnapshot, Booking } from '@tripsmith/db';

const r = Router();

// Search hotels (illustrative; align with current Rapid payloads)
r.post('/search', async (req, res, next) => {
  try {
    const { destination, checkIn, checkOut, adults = 2, currency = process.env.RAPID_CURRENCY || 'USD' } = req.body;

    const search = await rapid.post('/properties/list', {
      currency,
      occupancy: [{ adults }],
      destination: { regionId: destination },
      checkInDate: checkIn,
      checkOutDate: checkOut
    });

    const properties = search.data?.properties ?? [];

    // Record price snapshots
    const snaps = [];
    for (const p of properties) {
      const rp = p.ratePlans?.[0];
      const lead = rp?.price?.lead?.amount;
      if (lead) {
        snaps.push({
          kind: 'HOTEL',
          hotelId: String(p.id),
          amount: Number(lead),
          currency: rp.price?.currency || currency,
          meta: { name: p.name, regionId: destination }
        });
      }
    }
    if (snaps.length) await PriceSnapshot.insertMany(snaps, { ordered: false }).catch(()=>{});

    res.json({ properties });
  } catch (e) {
    next(e);
  }
});

// Book hotel (illustrative; include priceCheck/rate token per Rapid spec)
r.post('/book', async (req, res, next) => {
  try {
    const { propertyId, ratePlanId, guests, payment } = req.body;

    const booking = await rapid.post('/bookings/create', {
      propertyId, ratePlanId, guests, payment
    });

    const itinerary = booking.data?.itinerary ?? {};

    await Booking.create({
      userId: 'anon',
      kind: 'HOTEL',
      provider: 'rapid',
      providerId: String(itinerary.id || ''),
      status: itinerary.status || 'CONFIRMED',
      totalAmount: Number(itinerary.totalPrice?.amount || 0),
      currency: itinerary.totalPrice?.currency || 'USD',
      raw: booking.data
    });

    res.json(booking.data);
  } catch (e) {
    next(e);
  }
});

export default r;
