# SebeVerify: Complete Backend API Architecture

To make the entire SebeVerify platform function securely end-to-end, your Backend Engineering Team needs to build exactly **5 API Endpoints**.

To keep things secure, these are split into two categories: **Merchant-Facing APIs** (used securely on a server) and **Internal Frontend APIs** (used openly by the Next.js Camera).

---

## Part A: Merchant-Facing APIs
These are the extremely secure endpoints that the Merchant's Backend Server will call. *A merchant should NEVER put their secret API keys directly into the frontend code.*

### 1. Generate Verification Session
**Endpoint:** `POST /api/v1/sessions`
**Who calls it:** The Merchant's Server.
**How it works:** When a user wants to verify their identity on a merchant's site, the merchant's backend server authenticates with SebeVerify using their **Private Secret Key** (`sk_live_...`). 
The SebeVerify backend generates a temporary, 15-minute `sessionToken` and returns it. The merchant then passes this token to their frontend to securely open the camera safely without exposing their secret key.
```json
// Response to Merchant
{ "sessionId": "sess_abc123456789", "expiresIn": 900 }
```

### 2. Get Verification Result
**Endpoint:** `GET /api/v1/sessions/{sessionId}`
**Who calls it:** The Merchant's Server.
**How it works:** If the merchant wants to manually check if "User X" passed or failed their background check, they query this endpoint. It returns the final data (whether the face matched the ID, the extracted name, etc.).

---

## Part B: Internal Frontend APIs
These endpoints are what the **Next.js Camera App** explicitly calls while the user is actively taking pictures.

### 3. Secure File Upload 
**Endpoint:** `POST /api/internal/upload`
**Who calls it:** The Next.js Camera Application.
**How it works:** Because ID photos and selfies are extremely large (up to 5MB each), the frontend streams these images to the backend one by one as `multipart/form-data`. The backend securely saves them to AWS S3 (or equivalent Cloud Storage) and ties them to the active `sessionToken`.

### 4. Complete & Process Handshake
**Endpoint:** `POST /api/internal/complete`
**Who calls it:** The Next.js Camera Application.
**How it works:** As soon as the final selfie is captured, the frontend pings this endpoint. It tells the backend: *"The user is done taking pictures. Lock the session and run the A.I. comparison!"*

---

## Part C: The Outbound Engine

### 5. The Webhook Dispatcher
**Action:** `POST https://merchant-website.com/webhook`
**Who calls it:** SebeVerify's Backend.
**How it works:** Merchants don't want to constantly ask your server "Is the user verified yet?". Instead, your backend team needs to build a Webhook Engine. As soon as the AI finishes processing the files from Endpoint #4, your server instantly shoots a secure outbound HTTP POST request directly to the Merchant's server, notifying them that the user either Passed or Failed!
