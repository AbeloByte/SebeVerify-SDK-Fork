# SebeVerify Web SDK: Architecture & Integration Blueprint

This document outlines the technical architecture of the embeddable SebeVerify SDK, detailing how it is compiled for distribution, how it operates today, and the roadmap for its real-world integration.

---

## 1. How the SDK is Built (The Compilation Process)

The SebeVerify application serves two distinct purposes: 
1. It hosts the Next.js Mobile Web App that captures documents.
2. It acts as a factory to build and distribute the **Embeddable NPM SDK** (`@sebeverify/web-sdk`).

### The Build Pipeline
The core logic for the embeddable SDK is heavily isolated from React and Next.js, written in pure vanilla TypeScript inside `lib/sebeverify-sdk.ts`. 

When the command `pnpm run build:sdk` is executed:
1. **Tsup Bundling:** The system uses `tsup` (a blazing fast esbuild wrapper) to package all the code in `lib/sebeverify-sdk.ts` into a lightweight, framework-agnostic JavaScript file (`dist/sebeverify-sdk.js`).
2. **Type Declarations:** It simultaneously runs `tsc` (TypeScript Compiler) to generate `.d.ts` declaration files.
3. **Distribution Readiness:** The output in the `/dist` folder can now be published to the NPM registry or hosted on a CDN. Because it is completely vanilla JavaScript, merchants can install it into any tech stack—from WordPress to raw HTML, Vue, or React.

---

## 2. Current Workflow: How It Works Today (Mock Mode)

Right now, the SDK simulates the entire lifecycle using local endpoints (`/api/mock/*`).

1. **Initialization:** A merchant imports the SDK and calls `SebeVerify.init({ apiKey, redirectUrl })`.
2. **Start Verification:** When `sebeVerify.start()` is triggered, the SDK contacts the Mock API to generate a temporary `sess_[time]` token.
3. **Routing Engine:** 
   - **If on Mobile:** The SDK uses `window.location.href` to instantly transition the user to the mobile verification web app (`/verify/sess_123`).
   - **If on Desktop:** The SDK creates an HTML `<style>` and `<div>` block, actively injecting a modal popup into the merchant's screen. This modal displays a QR Code tracking the exact `sess_123` token.
4. **Completion:** The mobile app completes the camera capture and hits the backend to mutate the session state to `approved`. The Desktop modal, which is polling the backend, detects the state change, displays a checkmark, and fires the `verify.on('success')` Javascript event so the merchant knows the user is verified.

---

## 3. Future Workflow: How It Will Work in Production

When the permanent backend API is prepared, the architecture will transition to a high-security, webhook-driven process.

### Phase 1: Secure Session Generation
Currently, the frontend SDK asks the server to create a session. In production, **frontend requests are insecure**. 
- The merchant's secure backend server will perform an authenticated API request to `api.sebeverify.com/v1/sessions` using their **Secret API Key**.
- SebeVerify will return a short-lived **Client Token**.
- The merchant injects this token into their frontend: `SebeVerify.init({ clientToken })`. This prevents unauthorized usage of your camera infrastructure.

### Phase 2: Execution & Liveness
The user traverses the same QR-Code or mobile redirection flow as before. However, instead of saving raw `.jpg` images to `document_data/`, the Next.js app will upload the encrypted Base64 images directly to AWS S3 buckets or your secure OCR pipelines for identity validation.

### Phase 3: The Webhook Handshake
Because real OCR and facial biometric comparisons take a few seconds, the mobile app won't give the final "Approved" state to the user immediately. 
1. The SDK triggers `verify.on('processing')` so the merchant shows a loading screen.
2. The SebeVerify backend finishes the AI validation.
3. SebeVerify sends a **Webhook HTTP request** directly to the merchant's backend server (e.g., `merchant.com/webhooks/sebeverify`).
4. The merchant's backend verifies the webhook signature and unlocks the user's account safely!
