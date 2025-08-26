'use client';
import { useState } from 'react';

export default function Home() {
  const [mode, setMode] = useState('flight'); // 'flight' | 'hotel'
  return (
    <>
      <h1>Plan & Book in one place</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={()=>setMode('flight')} aria-pressed={mode==='flight'}>Flights</button>
        <button onClick={()=>setMode('hotel')} aria-pressed={mode==='hotel'}>Stays</button>
      </div>
      {mode === 'flight' ? <FlightForm/> : <HotelForm/>}
    </>
  );
}

function FlightForm() {
  const [form, setForm] = useState({ origin:'SFO', destination:'JFK', departureDate:'2025-09-05', returnDate:'2025-09-12', adults:1, cabin:'economy' });
  const [offers, setOffers] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/flights/search', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    const data = await res.json();
    setOffers(data.data || []);
  };
  return (
    <form onSubmit={submit} style={{ display:'grid', gap:12, maxWidth:560 }}>
      <label>From <input value={form.origin} onChange={e=>setForm({...form, origin:e.target.value.toUpperCase()})} required /></label>
      <label>To <input value={form.destination} onChange={e=>setForm({...form, destination:e.target.value.toUpperCase()})} required /></label>
      <label>Depart <input type="date" value={form.departureDate} onChange={e=>setForm({...form, departureDate:e.target.value})} required /></label>
      <label>Return <input type="date" value={form.returnDate} onChange={e=>setForm({...form, returnDate:e.target.value})} /></label>
      <label>Adults <input type="number" min="1" value={form.adults} onChange={e=>setForm({...form, adults:+e.target.value})} /></label>
      <label>Cabin
        <select value={form.cabin} onChange={e=>setForm({...form, cabin:e.target.value})}>
          <option value="economy">Economy</option>
          <option value="premium_economy">Premium Economy</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </select>
      </label>
      <button type="submit">Search flights</button>

      {Array.isArray(offers) && offers.length>0 && (
        <ul style={{ listStyle:'none', padding:0, marginTop:12 }}>
          {offers.map(o=>(
            <li key={o.id} style={{ border:'1px solid #eee', padding:12, marginBottom:8, borderRadius:8 }}>
              <div><strong>{o.owner?.name}</strong></div>
              <div>Total: {o.total_currency} {o.total_amount}</div>
              <div style={{ fontSize:12, opacity:0.75 }}>
                {o.slices?.map((s, i)=>(
                  <div key={i}>
                    {s.segments?.[0]?.origin?.iata_code} → {s.segments?.at(-1)?.destination?.iata_code} • {s.duration}
                  </div>
                ))}
              </div>
              <button onClick={async ()=>{
                const passengers = [{ type:'adult', title:'mr', given_name:'Test', family_name:'User' }];
                const res = await fetch('/api/flights/book', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ offerId: o.id, passengers })});
                const data = await res.json();
                alert('Booked! Order ' + data.id);
              }}>Book this</button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

function HotelForm() {
  const [form, setForm] = useState({ destination:'1506246', checkIn:'2025-09-05', checkOut:'2025-09-10', adults:2 });
  const [results, setResults] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/hotels/search', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    const data = await res.json();
    setResults(data.properties || []);
  };
  return (
    <form onSubmit={submit} style={{ display:'grid', gap:12, maxWidth:560 }}>
      <label>Destination regionId <input value={form.destination} onChange={e=>setForm({...form, destination:e.target.value})} required /></label>
      <label>Check-in <input type="date" value={form.checkIn} onChange={e=>setForm({...form, checkIn:e.target.value})} required /></label>
      <label>Check-out <input type="date" value={form.checkOut} onChange={e=>setForm({...form, checkOut:e.target.value})} required /></label>
      <label>Adults <input type="number" min="1" value={form.adults} onChange={e=>setForm({...form, adults:+e.target.value})} /></label>
      <button type="submit">Search stays</button>

      {Array.isArray(results) && results.length>0 && (
        <ul style={{ listStyle:'none', padding:0, marginTop:12 }}>
          {results.map(p=>(
            <li key={p.id} style={{ border:'1px solid #eee', padding:12, marginBottom:8, borderRadius:8 }}>
              <div><strong>{p.name}</strong></div>
              <div>{p.address?.city}, {p.address?.countryCode}</div>
              <div>From {p.ratePlans?.[0]?.price?.currency} {p.ratePlans?.[0]?.price?.lead?.amount}</div>
              <button onClick={async ()=>{
                const payload = {
                  propertyId: p.id,
                  ratePlanId: p.ratePlans?.[0]?.id,
                  guests: [{ givenName:'Test', familyName:'User', email:'test@example.com' }],
                  payment: { /* fill with your provider's tokenized fields */ }
                };
                const resp = await fetch('/api/hotels/book', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
                const data = await resp.json();
                alert('Hotel booked! Itinerary ' + (data.itinerary?.id ?? ''));
              }}>Book room</button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
