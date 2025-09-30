const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'https://api.sumsub.com';

function signRequest({ method, urlPath, body = null, secret }) {
  const ts = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256', secret);
  signature.update(ts + method.toUpperCase() + urlPath);
  if (body) {
    signature.update(body);
  }
  return {
    'X-App-Access-Ts': ts,
    'X-App-Access-Sig': signature.digest('hex')
  };
}

async function createAccessToken({ appToken, secret, externalUserId, levelName, ttlInSecs = 600 }) {
  const urlPath = '/resources/accessTokens/sdk';
  const payload = JSON.stringify({ userId: externalUserId, levelName, ttlInSecs });
  const sigHeaders = signRequest({ method: 'post', urlPath, body: payload, secret });
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-App-Token': appToken,
    ...sigHeaders
  };
  const response = await axios({
    baseURL: BASE_URL,
    method: 'post',
    url: urlPath,
    headers,
    data: payload
  });
  return response.data;
}

module.exports = {
  createAccessToken
};
