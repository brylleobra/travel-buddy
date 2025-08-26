'use client';
import { useState } from 'react';

export default function ItineraryPage() {
  const [trip, setTrip] = useState({ destination: 'Tokyo', start: '2025-10-10', end: '2025-10-16', budgetCurrency: 'USD', budget: 1800 });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/itinerary/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ trip, preferences: { food:'ramen', pace:'medium' } })
      });
      const data = await res.json();
      const content = data.message?.content || data?.choices?.[0]?.message?.content || '';
      const json = safeParse(content) || data;
      setPlan(json);
    } finally { setLoading(false); }
  };

  return (
    <>
      <h1>Your itinerary</h1>
      <div style={{ display:'grid', gap:8, maxWidth:560, marginBottom:12 }}>
        <label>Destination <input value={trip.destination} onChange={e=>setTrip({...trip, destination:e.target.value})} /></label>
        <label>Start <input type="date" value={trip.start} onChange={e=>setTrip({...trip, start:e.target.value})} /></label>
        <label>End <input type="date" value={trip.end} onChange={e=>setTrip({...trip, end:e.target.value})} /></label>
      </div>
      <button onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate with AI'}</button>
      {plan && (
        <pre style={{ whiteSpace:'pre-wrap', background:'#f7f7f7', padding:12, marginTop:12 }}>
          {JSON.stringify(plan, null, 2)}
        </pre>
      )}
    </>
  );
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
