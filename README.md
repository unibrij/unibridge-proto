# 🌉 UniBridge Protocol – Bridge Key Directory (BKD)

**Functional Prototype (v2.3)**  
Built on **Vercel Edge Functions + Upstash Redis**

---

## 🚀 Overview

The **Bridge Key Directory (BKD)** is a **non-custodial registry layer** developed by **UniBridge Technologies Inc.**  
It enables cross-border interoperability between wallet providers and anchors on the **Stellar Network**.

This functional prototype demonstrates the two essential BKD operations:
- **Register** → to store bridge entries  
- **Resolve** → to fetch bridge entries  

---

## 🧩 Interactive Demo (Swagger UI)

📘 **Live API Documentation:**  
👉 [https://unibridge-proto-v2.vercel.app/docs](https://unibridge-proto-v2.vercel.app/docs)

> 🔐 **Access Control (Basic Auth)**  
> The Swagger UI is restricted to invited partners and investors.  
> Each invitee receives a **unique username and password** issued by UniBridge.  
> Credentials must not be shared or redistributed.

---

## 🧰 Step Before Testing (Authorize)

Before executing any request inside Swagger UI:

1. Click the **Authorize** button at the top (lock icon 🔒).  
2. In the **API key value** field, enter your assigned test key (e.g., `test1234`).  
3. Click **Authorize** → **Close**.  
4. You can now execute requests directly from Swagger.

> ⚠️ All API calls require the `x-api-key` header.  
> If not provided, the response will return **401 unauthorized**.

---

## 🔑 API Endpoints

---

### 1️⃣ `/api/bridge/register` — Register / Store a Record

#### ➤ Using Swagger UI:
1. Select **POST /api/bridge/register**  
2. Click **“Try it out”**  
3. Paste the following sample into the **Request Body**:

```json
{
  "key": "demo-key",
  "wallet_id": "wallet123",
  "anchor_id": "anchorX",
  "provider_id": "providerY"
}
```

4. Click **Execute**

✅ Expected Response:
```json
{
  "ok": true,
  "stored": {
    "wallet_id": "wallet123",
    "anchor_id": "anchorX",
    "provider_id": "providerY",
    "ts": 1761869815797
  }
}
```

---

#### ➤ Using Terminal (cURL):
```bash
curl -X POST 'https://unibridge-proto-v2.vercel.app/api/bridge/register'   -H 'x-api-key: test1234'   -H 'Content-Type: application/json'   -d '{
        "key": "demo-key",
        "wallet_id": "wallet123",
        "anchor_id": "anchorX",
        "provider_id": "providerY"
      }'
```

---

### 2️⃣ `/api/bridge/resolve` — Resolve / Fetch a Record

#### ➤ Using Swagger UI:
1. Select **GET /api/bridge/resolve**  
2. Click **“Try it out”**  
3. Fill the parameter:  
   - `key`: `demo-key`  
4. Click **Execute**

✅ Expected Response:
```json
{
  "status": "resolved",
  "key": "demo-key",
  "wallet_id": "wallet123",
  "anchor_id": "anchorX",
  "provider_id": "providerY",
  "ts": 1761869815797
}
```

---

#### ➤ Using Terminal (cURL):
```bash
curl -X GET 'https://unibridge-proto-v2.vercel.app/api/bridge/resolve?key=demo-key'   -H 'x-api-key: test1234'
```

---

## 🛡️ Security Notes

- All requests must include the header:  
  `x-api-key: <your_api_key>`  
- Swagger UI access is protected by Basic Auth (unique credentials per invite).  
- The prototype is **stateless** and **non-custodial** — no sensitive data or private keys are stored.  
- Entries are cached in **Upstash Redis** for 1 hour (TTL = 3600s).

---

## 🧠 Architecture Snapshot

| Component | Description |
|------------|--------------|
| **Frontend Docs** | Swagger UI hosted on Vercel |
| **Backend Runtime** | Vercel Edge Functions (Node 18) |
| **Cache Layer** | Upstash Redis |
| **Security** | x-api-key + Basic Auth |
| **Schema** | key → `{ wallet_id, anchor_id, provider_id, ts }` |

---

## 🧾 Environment Variables

| Variable | Example | Description |
|-----------|----------|-------------|
| `API_KEY` | `test1234` | Required for all requests |
| `UPSTASH_REDIS_REST_URL` | `https://polite-insect-29441.upstash.io` | Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | `********` | Redis access token |

---

## ⚙️ Deployment Info

| Platform | Details |
|-----------|----------|
| **Vercel Project** | `unibridge-proto-v2` |
| **Region** | São Paulo → Washington (Edge Function) |
| **Cache TTL** | 1 hour (3600s) |

---

## 🔜 Next Step: MVP Transition

The **closed sandbox environment** for early partners and investors is now live —  
providing real-time access to the BKD protocol through secured API endpoints.

The next milestone focuses on transitioning from the sandbox phase to the **MVP release**,  
adding persistent storage (Postgres), key management, and partner-specific integrations  
with selected **Stellar anchors** to validate the production model.

---

## 💼 Contact & Access

**UniBridge Technologies Inc.**  
🌐 [unibridge.tech](https://unibridge.tech)  
📧 contact@unibridge.tech  

For sandbox credentials or API access invitations,  
please reach out through your official UniBridge invitation link or contact us directly.

---

> _Version v2.3 – Confidential sandbox access for invited partners and investors only._
