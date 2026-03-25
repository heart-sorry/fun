export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // For now, return mock data - Vercel KV requires paid plan
  // We'll use Vercel Postgres or another solution
  
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'API is working! Database coming soon.'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
