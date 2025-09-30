const dotenv = require('dotenv');
dotenv.config({ path: './config.env' })
const express = require('express');
const { createAccessToken } = require('./sumsubClient');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Ultra-permissive CORS (allows any origin). Remove or tighten for production security.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Handle preflight quickly
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const APP_TOKEN = process.env['SUMSUB_APP_TOKEN'];
const SECRET_KEY = process.env['SUMSUB_SECRET_KEY'];

if (!APP_TOKEN || !SECRET_KEY) {
  console.warn('[WARN] SUMSUB_APP_TOKEN or SUMSUB_SECRET_KEY not set. Define them in a .env file or environment variables.');
}

function generateExternalUserId() {
  return 'web-' + Math.random().toString(36).slice(2, 12);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// POST /api/token or /api/token/:level (level param wins over body)
app.post(['/api/token', '/api/token/:level'], async (req, res) => {
  try {
    const levelName = req.params.level || req.body.levelName || 'basic-kyc-level';
    const ttlInSecs = req.body?.ttlInSecs || 600;
    const externalUserId = generateExternalUserId();

    const data = await createAccessToken({
      appToken: APP_TOKEN,
      secret: SECRET_KEY,
      externalUserId,
      levelName,
      ttlInSecs
    });

    res.json({
      success: true,
      externalUserId,
      levelName,
      ttlInSecs,
      token: data.token,
      issuedAt: data.createdAt
    });
  } catch (err) {
    console.error('Error generating token', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
