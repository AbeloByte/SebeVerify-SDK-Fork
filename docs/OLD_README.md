# SebeVerify Web SDK

SebeVerify Web SDK is a robust, mobile-first identity verification application built with Next.js. It provides a seamless, step-by-step user interface for capturing official identification documents (National IDs, Passports) and facial selfies using native device cameras. 

## 🚀 Tech Stack
- **Framework:** Next.js (App Router, Turbopack)
- **Library:** React 19
- **Language:** TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS, Radix UI (Shadcn)
- **Icons:** Lucide React

## ✨ Key Features
- **Mobile-First UX:** Automatically detects desktop users and elegantly blocks them with a QR Code overlay, forcing them to transition to their mobile device to access the camera hardware.
- **Dynamic Camera Capture:** Robust `getUserMedia` integration that automatically requests the correct camera (environment face for IDs, user face for selfies). Features fallback modes for multi-lens Android/Samsung devices.
- **Intelligent Flow Control:** Step-by-step verification logic tailored by document type (e.g., skips the back-card scan for Passports).
- **Local Data Storage:** Submissions are bundled via the mock API and saved directly into the local `document_data/sess_[id]` directory as raw `.jpg` files alongside a `metadata.json` payload.
- **Touch-Optimized:** Custom React lifecycle and touch-event mappings guarantee that UI buttons are perfectly responsive, bypassing Chromium's tap-to-scroll cancellation bugs.

## 📦 Project Structure
- `app/verify/`: The core Next.js App Router endpoints. Handles the layout gate and initializes the Client component framework.
- `app/api/mock/`: Next.js Route handlers that mock the backend API architecture. Contains the final submission logic to write Base64 images to the local filesystem.
- `components/verification/`: Contains the modular UI steps (`intro-screen`, `doc-select`, `camera-capture`, `review-document`, etc.).
- `lib/verification-store.ts`: The central Zustand state architecture powering the step-by-step progression and holding image data.

## 🛠 Getting Started

### 1. Installation
Install the project dependencies using `pnpm`:
```bash
pnpm install
```

### 2. Running for Development
For standard frontend modifications, you can use the Fast Refresh developer server:
```bash
pnpm run dev
```

### 3. Running for Production / Camera Testing (Recommended)
If you need to test the application on your physical mobile phone via a local IP address (e.g. `http://10.X.X.X:3000`), we strongly recommend running the Production Build. The Next.js Turbopack dev-server and Ngrok tunnels often block or fracture the interactive React JavaScript required to initialize the camera stream on local networks.

To test flawlessly on a mobile device:
```bash
pnpm run build && pnpm start
```

## ⚠️ Important: Testing the Camera on a Local IP Address
Modern mobile browsers have strict security protocols that block camera hardware access over standard HTTP connections (except for `localhost`). When testing your app on a physical phone over your Local Area Network (`http://10.x.x.x:3000`), the camera will be blocked.

To bypass this without dealing with HTTPS certificates or Ngrok, use the Chrome Developer built-in bypass:

1. Open Android Google Chrome.
2. In the URL bar, go to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Enter your active server IP address in the text box (e.g. `http://10.240.71.46:3000`).
4. Select **Enabled** and hit the blue **Relaunch** button.
5. You can now access your Local IP and Chrome will allow full Camera access!

## 💾 Where is the Data Saved?
Since the official backend endpoint is not yet configured, the system writes everything locally for testing.
Once you complete a verification flow, the `app/api/mock/session/[id]/complete` endpoint intercepts the request. It extracts your Base64 picture strings and saves them natively to a generated folder at the root of the project:
`./document_data/sess_[unique_id]/`

## 🔌 The Embeddable SDK Package
The true power of SebeVerify lies in its **Embeddable NPM Package SDK**, which third-party merchants install into their own websites to trigger our app. 

The core logic for this is located in `lib/sebeverify-sdk.ts`.

### How It Works:
- **Routing Intelligence:** When a merchant fires `SebeVerify.start()`, the SDK detects the user's device. If they are on a mobile device, it redirects them instantly to the Next.js verification app.
- **Desktop QR Injection:** If the user is on a Desktop, the SDK seamlessly injects a stylized raw HTML/CSS modal *directly inside the merchant's application*. This popup displays the QR code and actively listens/polls for the Mobile app to finish!

### Building the Package
To compile the standalone SDK for distribution (via NPM or CDN), run the SDK build script:
```bash
pnpm run build:sdk
```
This leverages `tsup` to compile the TypeScript into a clean `dist/sebeverify-sdk.js` file.

### Merchant Integration Example
When developers want to integrate SebeVerify into their site, they simply do this:
```javascript
import SebeVerify from '@sebeverify/web-sdk';

const verify = SebeVerify.init({ 
  apiKey: 'YOUR_API_KEY', 
  redirectUrl: 'https://verify.yourdomain.com' 
});

// Launch the verification popup / flow
verify.start();

// Listen for a successful mobile submission
verify.on('success', (result) => {
  console.log("User successfully captured documents!", result);
});
```
