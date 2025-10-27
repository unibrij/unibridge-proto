export default async function handler(req, res) {
  res.status(200).json({
    apiKeyEnv: (process.env.API_KEY || process.env.CLIENT_KEY) ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
    headerKey: req.headers['x-api-key'] ?? null
  });
}
