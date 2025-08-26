import { PriceSnapshot, Deal } from '@tripsmith/db';

export async function runDealDetection() {
  // Flights: detect anomalous drop vs recent baseline
  const routes = await PriceSnapshot.distinct('route', { kind: 'FLIGHT', route: { $ne: null } });
  for (const route of routes) {
    const snaps = await PriceSnapshot.find({ kind: 'FLIGHT', route }).sort({ capturedAt: -1 }).limit(300).lean();
    if (snaps.length < 20) continue;

    const values = snaps.map(s => Number(s.amount)).filter(v => !Number.isNaN(v));
    const mean = avg(values);
    const std = stdev(values);
    const latest = values[0];
    const z = (latest - mean) / (std || 1);

    if (z <= -1.5) {
      const drop = Math.round(((mean - latest) / mean) * 100);
      await Deal.findOneAndUpdate(
        { title: `Deal on ${route}` },
        {
          $set: {
            summary: `Recent price ${latest} beats ~${drop}% vs recent avg.`,
            score: Math.abs(z),
            kind: 'FLIGHT',
            route,
            price: latest,
            currency: snaps[0].currency,
            validFrom: new Date()
          }
        },
        { upsert: true }
      );
    }
  }

  // Hotels: weekly pattern (cheapest DOW)
  const hotels = await PriceSnapshot.distinct('hotelId', { kind: 'HOTEL', hotelId: { $ne: null } });
  for (const hotelId of hotels) {
    const snaps = await PriceSnapshot.find({ kind: 'HOTEL', hotelId }).sort({ capturedAt: -1 }).limit(500).lean();
    if (snaps.length < 30) continue;

    const byDow = Array.from({ length: 7 }, () => []);
    for (const s of snaps) byDow[new Date(s.capturedAt).getUTCDay()].push(Number(s.amount));
    const dowAvg = byDow.map(arr => avg(arr));
    const minDow = dowAvg.indexOf(Math.min(...dowAvg));
    const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][minDow];

    await Deal.findOneAndUpdate(
      { title: `Pattern for hotel ${hotelId}` },
      { $set: { summary: `Typical lowest prices on ${dayName}`, score: 0.7, kind: 'HOTEL', hotelId } },
      { upsert: true }
    );
  }
}

function avg(arr){ return (arr.reduce((a,b)=>a+b,0))/(arr.length||1); }
function stdev(arr){
  const m = avg(arr);
  const v = avg(arr.map(x => (x-m)**2));
  return Math.sqrt(v);
}
