import { Router } from 'express';
import { duffel } from '../lib/duffel.js';
import { PriceSnapshot, Booking } from '@tripsmith/db';

const r = Router();

// Search flight offers
r.post('/search', async (req, res, next) => {
  try {
    const { origin, destination, departureDate, returnDate, adults = 1, cabin = 'economy' } = req.body;

    const offerReq = await duffel.post('/offer_requests', {
      data: {
        slices: [
          { origin, destination, departure_date: departureDate },
          ...(returnDate ? [{ origin: destination, destination: origin, departure_date: returnDate }] : [])
        ],
        passengers: Array.from({ length: adults }, () => ({ type: 'adult' })),
        cabin_class: cabin
      }
    });

    const orid = offerReq.data?.data?.id;
    const offers = await duffel.get(`/offers`, { params: { offer_request_id: orid, limit: 50 } });

    // store price snapshots
    const routeKey = `${origin}-${destination}-${departureDate}`;
    const items = offers.data?.data ?? [];
    if (items.length) {
      await PriceSnapshot.insertMany(items.map(o => ({
        kind: 'FLIGHT',
        route: routeKey,
        amount: Number(o.total_amount),
        currency: o.total_currency,
        meta: { offer_id: o.id, carrier: o.owner?.name }
      })), { ordered: false }).catch(()=>{});
    }

    res.json(offers.data);
  } catch (e) {
    next(e);
  }
});

// Book (create order). Adjust payments per your Duffel balance or PSP.
r.post('/book', async (req, res, next) => {
  try {
    const { offerId, passengers } = req.body;

    const orderResp = await duffel.post('/orders', {
      data: { selected_offers: [offerId], passengers }
    });
    const order = orderResp.data.data;

    await Booking.create({
      userId: 'anon',
      kind: 'FLIGHT',
      provider: 'duffel',
      providerId: order.id,
      status: order.status,
      totalAmount: Number(order.total_amount),
      currency: order.total_currency,
      raw: order
    });

    res.json(order);
  } catch (e) {
    next(e);
  }
});

export default r;
