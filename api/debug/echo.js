export default async function handler(req, res) {
  res.status(200).json({
    method: req.method,
    headers: req.headers,
    body: req.body ?? null
  });
}
