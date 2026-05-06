// Vercel serverless function: /api/qa-proxy
// Proxies requests to your Apps Script backend and returns JSON.

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const { from, to } = req.query;

  if (!from || !to) {
    res.status(400).json({ ok: false, error: "Missing from/to" });
    return;
  }

  // Put your Apps Script Web app URL (from Step 1.2) here
  const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxcwCNPdtATTa25ZVxbeSER9vUuNjTTtEq3ozCojjquuVBThO6CinpelbSMrZqm3IfVFw/exec";

  const target = `${SCRIPT_URL}?from=${encodeURIComponent(
    from
  )}&to=${encodeURIComponent(to)}`;

  try {
    const upstream = await fetch(target, { method: "GET" });
    const text = await upstream.text();

    try {
      const data = JSON.parse(text);
      res.status(upstream.status || 200).json(data);
    } catch (e) {
      res.status(502).json({
        ok: false,
        error: "Upstream did not return JSON",
        details: text.slice(0, 200),
      });
    }
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "Proxy request failed",
      details: err.message,
    });
  }
}
