<div align="center">

# SumSub Access Token Minimal Server
Generate SumSub Web/Mobile SDK access tokens securely via a tiny Express backend plus a simple static demo page.

</div>

## Contents
1. Quick Start
2. Architecture & Files
3. API Endpoints
4. Environment & Configuration
5. Local Development
6. Frontend Demo Page
7. Deployment (Render)
8. Security Notes & Hardening
9. Legacy Example Script

---

## 1. Quick Start
```bash
git clone <this-repo>
cd <repo-root>
cp .env.example .env   # OR create config.env if you prefer that name
edit .env              # add SUMSUB_APP_TOKEN & SUMSUB_SECRET_KEY
npm install
npm start
# Visit http://localhost:3000/
```

## 2. Architecture & Files
| File / Dir | Purpose |
|------------|---------|
| `server.js` | Express server, CORS-all, serves static demo, exposes token endpoint |
| `sumsubClient.js` | Encapsulates HMAC signing + access token creation call to SumSub |
| `public/index.html` | Minimal browser UI to request a token for a chosen level name |
| `AppTokenJsExample.js` | Original standalone script demonstrating broader API usage (create applicant, documents, etc.) |
| `.env.example` | Template for required environment variables |
| `config.env` | Optional alternative env file (loaded explicitly in `server.js`) |
| `resources/` | Assets used by the legacy example script |

### Flow
Browser → `POST /api/token/:level?` → Server signs request with secret → SumSub API → Returns SDK access token → Browser consumes token (e.g., to initialize WebSDK).

## 3. API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check JSON `{ status, time }` |
| POST | `/api/token` | Generate token (JSON body optional: `{ levelName, ttlInSecs }`) |
| POST | `/api/token/:level` | Same as above; URL param has priority over body `levelName` |

### Response Shape
```json
{
  "success": true,
  "externalUserId": "web-abc123xyz",
  "levelName": "basic-kyc-level",
  "ttlInSecs": 600,
  "token": "<sdk_access_token>",
  "issuedAt": 1732999999
}
```

## 4. Environment & Configuration
Required variables (put in `.env` or `config.env`):
```
SUMSUB_APP_TOKEN=sbx:YOUR_APP_TOKEN
SUMSUB_SECRET_KEY=YOUR_SECRET_KEY
# PORT optional (Render will inject one): PORT=3000
```
`server.js` loads `config.env` explicitly; if you prefer only `.env`, adjust the `dotenv.config` line or keep both with identical content.

## 5. Local Development
```bash
npm install
npm start
# or (if you add a dev script with nodemon) npm run dev
curl -s http://localhost:3000/health
curl -s -X POST http://localhost:3000/api/token/basic-kyc-level | jq
```

## 6. Frontend Demo Page
Located at `public/index.html` and automatically served at `/`.
Features:
- Input for level name (defaults to `basic-kyc-level`)
- TTL override
- Displays raw JSON response

Sample fetch (equivalent to page action):
```js
fetch('/api/token/basic-kyc-level', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ttlInSecs: 900 }) })
  .then(r => r.json())
  .then(console.log);
```

## 7. Deployment (Render)
1. Create new Web Service → connect repo → leave Root Directory blank.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Environment Variables: `SUMSUB_APP_TOKEN`, `SUMSUB_SECRET_KEY`.
5. After deploy test:
```bash
curl https://<your-service>.onrender.com/health
curl -X POST https://<your-service>.onrender.com/api/token/basic-kyc-level
```

## 8. Security Notes & Hardening
Current configuration intentionally sets permissive CORS (`*`). For production you likely want to:
- Restrict `Access-Control-Allow-Origin` to known domains.
- Add a simple rate limiter (e.g., `express-rate-limit`).
- Persist `externalUserId` for returning users instead of per-request random.
- Add request logging + correlation IDs.
- Monitor token issuance counts.

## 9. Legacy Example Script
`AppTokenJsExample.js` remains for reference to broader workflow (create applicant, upload document, status, token). It is not used by the server. Run manually if needed:
```bash
node AppTokenJsExample.js
```

---
Maintained as a minimal reference implementation—extend according to your product’s KYC flow requirements.
