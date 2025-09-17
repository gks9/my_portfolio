// File: api/contact.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  const { name, from, message } = req.body || {};
  if (!name || !from || !message) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }
  // TODO: Integrate an email service or SMTP if desired via environment variables.
  // For now, acknowledge receipt so the frontend can show success.
  return res.status(200).json({ ok: true });
}
