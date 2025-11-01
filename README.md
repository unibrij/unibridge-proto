# 🌉 UniBridge Protocol – Bridge Key Directory (BKD)

**Functional Prototype (v2.4.1)**  
Built on **Vercel Edge Functions + Upstash Redis**

---

## 🚀 Overview

The **Bridge Key Directory (BKD)** is a **non-custodial registry layer** developed by **UniBridge Technologies Inc.**  
It enables cross-border interoperability between wallet providers and anchors on the **Stellar Network**.

This prototype demonstrates the three essential BKD operations:

1. **Register** → store a Bridge Key mapping (ex: phone/email → wallet address / payout handle)  
2. **Resolve** → fetch an existing mapping from the directory  
3. **Route-Quote** → return a corridor quote + payout path for cross‑border transfer (US→MX pilot)

These three together are the “minimal protocol loop” you’re validating with partners.

---

## 🧩 Interactive Demo (Swagger UI)

📘 **Live API Documentation:**  
👉 https://unibridge-proto-v2.vercel.app/docs

> 🔐 **Access Control (Basic Auth)**  
> The Swagger UI is restricted to invited partners and investors.  
> Each invitee receives a **unique username and password** issued by UniBridge.  
> Credentials must not be shared or redistributed.

---

## 🧰 Step Before Testing (Authorize)

Before executing any request inside Swagger UI:

1. Click the **Authorize** button at the top (lock icon 🔒).  
2. In the **API key value** field, enter your assigned test key (e.g. `test1234`).  
3. Click **Authorize** → **Close**.  
4. You can now execute requests directly from Swagger.

> ⚠️ All API calls require the `x-api-key` header.  
> If not provided, the response will return **401 unauthorized**.

---

## 🔑 API Endpoints

Below are the 3 live endpoints exposed in this functional prototype.

---

### 1️⃣ `/api/bridge/register` — Register / Store a Record

**Purpose**  
Bind a human-facing key (phone / email / handle / IBAN-like alias) to a payout destination on a specific network.

**Request**  
`POST https://unibridge-proto-v2.vercel.app/api/bridge/register`  
Headers:
- `x-api-key: test1234`
- `Content-Type: application/json`

Body:
```json
{
  "key": "+1-202-555-0199",
  "value": "GABCDEF1234567890WALLETADDR",
  "asset": "USDC",
  "network": "Stellar"
}
```

**Successful response (200):**
```json
{ "ok": true }
```

**Test via curl:**
```bash
curl -X POST "https://unibridge-proto-v2.vercel.app/api/bridge/register"   -H "x-api-key: test1234"   -H "Content-Type: application/json"   -d '{
    "key": "+1-202-555-0199",
    "value": "GABCDEF1234567890WALLETADDR",
    "asset": "USDC",
    "network": "Stellar"
  }'
```

---

### 2️⃣ `/api/bridge/resolve` — Resolve / Fetch a Record

**Purpose**  
Look up a key previously registered and retrieve its mapped destination.

**Request**  
`GET https://unibridge-proto-v2.vercel.app/api/bridge/resolve?key=<value>`  
Headers:
- `x-api-key: test1234`

Example request:
```text
GET /api/bridge/resolve?key=+1-202-555-0199
```

**Expected response (200):**
```json
{
  "key": "+1-202-555-0199",
  "value": "GABCDEF1234567890WALLETADDR",
  "asset": "USDC",
  "network": "Stellar"
}
```

**Test via curl:**
```bash
curl -G "https://unibridge-proto-v2.vercel.app/api/bridge/resolve"   --data-urlencode "key=+1-202-555-0199"   -H "x-api-key: test1234"
```

---

### 3️⃣ `/api/bridge/route-quote` — Get Corridor Quote (US→MX Pilot)

**Purpose**  
Return a simulated quote for sending USD → MXN, including:  
- FX rate (static placeholder)  
- payout estimate in MXN  
- UniBridge fee (bps = 0.1%)  
- rough settlement ETA  
- the intended asset path (ex: USDC on Circle → Stellar → Bitso → MX payout)

**Request**  
`POST https://unibridge-proto-v2.vercel.app/api/bridge/route-quote`  
Headers:
- `x-api-key: test1234`
- `Content-Type: application/json`

Body:
```json
{
  "source": {
    "currency": "USD",
    "amount": 100,
    "country": "US"
  },
  "destination": {
    "currency": "MXN",
    "country": "MX",
    "receiver_key": "+52-55-1234-5678"
  },
  "partner_id": "corridor_US_MX_v1"
}
```

**Successful response (200):**
```json
{
  "quote_id": "qt_usmx_1761957913612",
  "corridor": "US->MX",
  "partner_id": "corridor_US_MX_v1",
  "amount_in": 100,
  "amount_out": 1703.16,
  "fx_rate": 17.1,
  "total_fees": 0.4,
  "unibridge_fee_bps": 10,
  "valid_for_seconds": 120,
  "estimated_settlement_seconds": 60,
  "path": [
    "Circle_USDC",
    "Stellar_USDC",
    "Bitso_MXN",
    "MX_Payout"
  ],
  "note": "Live-static US→MX corridor quote. FX/fees are placeholders."
}
```

**Test via curl:**
```bash
curl -X POST "https://unibridge-proto-v2.vercel.app/api/bridge/route-quote"   -H "x-api-key: test1234"   -H "Content-Type: application/json"   -d '{
    "source": {"currency":"USD","amount":100,"country":"US"},
    "destination": {"currency":"MXN","country":"MX","receiver_key":"+52-55-1234-5678"},
    "partner_id":"corridor_US_MX_v1"
  }'
```

---

## 🧠 Error Handling & Security Guarantees

| Code | Meaning | Trigger Example |
|------|----------|-----------------|
| **200 OK** | Successful request | Valid payload with correct API key |
| **400 Bad Request** | Missing required fields | e.g. `receiver_key` missing in `/route-quote` |
| **401 Unauthorized** | Missing or invalid `x-api-key` | No API key or wrong key |
| **404 Not Found** | Key not found in directory | `/resolve` lookup misses |
| **405 Method Not Allowed** | Invalid HTTP method | GET on a POST-only endpoint |

> 🧩 Each endpoint enforces explicit method checks and authentication.  
> This makes the prototype behave like a production-grade API contract, not just a demo.

---

## 🛡️ Security Notes

- Every request must include:  
  `x-api-key: <your_api_key>`  
- Swagger UI protected by Basic Auth (unique per invitee).  
- The BKD is **non-custodial**: we store mappings (key → destination), not balances or funds.  
- Directory state cached in Upstash Redis (TTL = 1 hour).  

---

## ⚙️ Deployment Info

| Platform | Details |
|-----------|----------|
| Vercel Project | `unibridge-proto-v2` |
| Runtime | Node 18 Edge Functions |
| Cache | Upstash Redis |
| Regions | São Paulo → US edge |
| TTL | 3600 s |

---

## 🧾 Environment Variables

| Variable | Example | Description |
|-----------|----------|-------------|
| `API_KEY` | `test1234` | Global access key for prototype |
| `UPSTASH_REDIS_REST_URL` | `https://polite-insect-29441.upstash.io` | Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | `********` | Redis token |
| `DOCS_USER` / `DOCS_PASS` | `partnerA` / `********` | Basic Auth for `/docs` |

---

## Author & Functional Prototype Notes

Functional prototype architecture and implementation initiated by **Wael Al Derani (Founder, UniBridge Technologies Inc.)**  
Date: **October 2025** – Functional prototype deployed on **Vercel** (`register`, `resolve`, `route-quote` endpoints).  

This version (v2.4.1) represents the complete functional cycle of the BKD protocol, including:
- Non-custodial registry (Bridge Key Directory)
- Live-static corridor quote (US→MX)
- API documentation (Swagger) with Basic Auth + API Key protection

---

## 💼 Contact

**UniBridge Technologies Inc.**  
🌐 https://unibrij.io  
📧 ceo@unibrij.io  

---

> _Version v2.4.1 – Confidential sandbox access for invited partners and investors only._
