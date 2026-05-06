export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || '';
  const safe = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  res.send(`window.__SUPABASE_URL__ = '${safe(url)}'; window.__SUPABASE_ANON_KEY__ = '${safe(key)}';`);
}