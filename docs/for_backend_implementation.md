# Backend Implementation Guide for SebeVerify SDK

This guide outlines the requirements for building a production-ready backend that integrates with the SebeVerify Web SDK.

## 1. Authentication & Security

In production, all backend-to-backend communication MUST be authenticated.

### API Keys
- Provide merchants with a **Secret API Key** for server-side requests.
- Use a **Public API Key** (or Client Token) for frontend SDK initialization.

### Secure Session Creation
Do not allow the frontend to create sessions directly. The merchant's backend should initiate the session.

**Endpoint:** `POST /v1/sessions`
**Headers:** `Authorization: Bearer <SECRET_API_KEY>`
**Payload:**
```json
{
  "merchantReference": "order_123",
  "callbackUrl": "https://merchant.com/webhooks/sebeverify",
  "redirectUrl": "https://merchant.com/thanks"
}
```
**Response:**
```json
{
  "sessionId": "sess_abc123",
  "clientToken": "ct_xyz789",
  "verificationUrl": "https://verify.sebeverify.com/sess_abc123"
}
```

## 2. Image & Data Handling

The SDK sends Base64 encoded images. These should be processed and stored securely.

### Expected Data Payload (PATCH /v1/sessions/:id)
- `frontImage`: Base64 JPEG (ID Front)
- `backImage`: Base64 JPEG (ID Back - Optional for Passport)
- `selfieImage`: Base64 JPEG (Main Selfie)
- `livenessImages`: Array of 3 Base64 JPEGs (Challenge snapshots)
- `documentType`: string (`passport` | `national_id` | `driver_license`)

### Storage Strategy
- **DO NOT** store Base64 strings in your database.
- Upload images to a secure private bucket (e.g., AWS S3, Google Cloud Storage) with limited-time signed URLs for viewing.

## 3. Verification Logic (AI/OCR/Biometrics)

Once the session is marked as `completed` (all images uploaded), your backend should trigger the processing pipeline:

1. **OCR Extraction:** Extract name, DOB, expiry, and document number.
2. **Liveness Validation:** Verify that the 3 liveness images show the requested gestures (Smile, Blink, Turn).
3. **Face Matching:** Compare the `selfieImage` or liveness frames against the ID photo.
4. **Authenticity Check:** Check for signs of tampering or digital manipulation.

## 4. Webhook Notification

Since AI processing takes time, use webhooks to notify the merchant's system of the result.

**Webhook Payload:**
```json
{
  "sessionId": "sess_abc123",
  "status": "approved",
  "data": {
    "fullName": "John Doe",
    "documentNumber": "A1234567",
    "faceMatchScore": 0.98,
    "livenessVerified": true
  }
}
```

## 5. Summary of Mock to Production Migration
| Feature | Mock Implementation | Production Requirement |
|---------|---------------------|------------------------|
| Session Store | In-memory Map | Redis / Postgres / MongoDB |
| Auth | None | Bearer Token (Secret Key) |
| File Storage | Local `document_data/` | Cloud Storage (S3/GCS) |
| Completion | Instant `status: approved` | Asynchronous AI Processing + Webhook |
