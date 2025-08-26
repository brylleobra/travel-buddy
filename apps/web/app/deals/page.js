export const dynamic = 'force-dynamic';

async function getDeals() {
  const res = await fetch('http://localhost:4000/api/deals', { cache: 'no-store' });
  return res.json();
}

export default async function Deals() {
  const deals = await getDeals();
  return (
    <>
      <h1>Today’s best deals</h1>
      <ul style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12, listStyle:'none', padding:0 }}>
        {deals.map(d=>(
          <li key={d._id} style={{ border:'1px solid #eee', padding:12, borderRadius:8 }}>
            <div><strong>{d.title}</strong></div>
            <div style={{ fontSize:14, opacity:0.85 }}>{d.summary}</div>
            {d.price && <div style={{ marginTop:4 }}>~ {d.currency} {d.price}</div>}
            {Array.isArray(d.sourceIds) && d.sourceIds.length > 0 && (
              <small style={{ display:'block', marginTop:6 }}>Sources: {d.sourceIds.map(id=>`[S:${id}]`).join(' ')}</small>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
