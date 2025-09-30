# How to run the examples

1. Check you have node and npm installed.

```shell
node --version
npm --version
```

2. Install dependencies.

```shell
npm i
```

4. Update app token values.

```js
const SUMSUB_APP_TOKEN = '';
const SUMSUB_SECRET_KEY = '';
```

5. Run the examples.

```shell
node AppTokenJsExample.js
```

## Minimal Backend for Browser Integration

Added an Express server exposing a single endpoint for generating SumSub SDK access tokens without exposing secrets to the browser.

### Endpoints
| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | /health | Health check |
| POST | /api/token | Generate token (JSON body optional: `{ levelName, ttlInSecs }`) |
| POST | /api/token/:level | Generate token for specific level |

Response example:
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

### Run Backend Locally
```bash
cp .env.example .env
# edit .env with your credentials
npm install
npm start
# open http://localhost:3000/ to use the demo page
```

### Frontend Demo
`public/index.html` fetches `/api/token/<level>` and prints the JSON response.

## Deploy to Render.com
1. Push this repository to GitHub.
2. Create a new Web Service in Render:
	- Build Command: `npm install`
	- Start Command: `npm start`
3. Add Environment Variables:
	- `SUMSUB_APP_TOKEN`
	- `SUMSUB_SECRET_KEY`
	- (Optional) `PORT` (Render sets one automatically)
4. Deploy and test `/health` endpoint.
5. Open root URL to access the demo UI.

### Notes
- Never expose `SUMSUB_SECRET_KEY` in frontend code.
- `externalUserId` is generated per request; persist if you need continuity.
- Adjust default TTL or level via request body or URL param.
