# SebeVerify ✨

SebeVerify is a state-of-the-art Identity Verification and KYC (Know Your Customer) platform designed to easily integrate directly into merchant applications. It allows users to securely verify their identity via ID capture and facial liveness checks, utilizing a seamless "Desktop-to-Mobile" QR code handoff.

## 🏗️ Project Architecture (Root Workspace Monorepo)

This project has been heavily restructured into a **Root Workspace Monorepo** using `pnpm`. This architecture provides massive benefits for both deployment speed and NPM publishing purity.

### 1. The Core Web Application (Next.js)
**Location:** `/` (Project Root)
*   **Purpose:** The central UI application that powers the Dashboard, onboarding, and the highly-interactive Mobile Camera Flow.
*   **Deployment:** Powered by Next.js 14/15 App Router, this root folder is natively picked up by platforms like Vercel for absolute "zero-config" deployment.
*   **Key Tech:** React, Next.js, Tailwind CSS, Shadcn UI, Zustand State Management.

### 2. The Merchant Web SDK (`@sebeverify/web-sdk`)
**Location:** `/packages/sdk/`
*   **Purpose:** A hyper-lightweight, 0-dependency, Vanilla JavaScript SDK that merchants install via NPM. This script is dropped onto merchant websites to trigger the SebeVerify system.
*   **Purity:** By isolating this in `packages/sdk` and defining it in `pnpm-workspace.yaml`, we guarantee that massive framework dependencies (like React and Next.js) **never** bloat the final NPM package.
*   **Build System:** Uses `tsup` for micro-bundling and fast TypeScript compilation logic.

---

## 🚀 Core Functionality & Features

### The Verification Flow
1. **Cross-Device Handoff:** Desktop users are presented with a QR code, gracefully transferring their secure active session to their mobile device for high-quality camera capture.
2. **Document Capture Engine:** Guides users to physically photograph the front and back of their Government ID (National ID, Passport, Driver's License) with overlay guidance.
3. **Robust Hardware Layer:** Integrates highly resilient WebRTC code. Features advanced "Camera Driver Cooldown" loop intervals to gracefully handle rapid lens switching without crashing legacy Android/iOS hardware or hitting `NotReadableError`.
4. **Selfie & Active Liveness:** The final stage of capture ensures identity validity before securely handing the verified state back to the merchant via Webhooks.

---

## 🛠️ Developer Setup & Commands

### Running Locally
To launch the core Next.js application for development:
```bash
pnpm install
pnpm run dev
```

*Note: For testing on external mobile devices over local Wi-Fi, ensure your phone's IP address (e.g., `192.168.1.3`) is added to `allowedDevOrigins` in `next.config.mjs` to bypass Next.js 15 dev-security blocks.*

### Publishing the SDK
To build and publish the Merchant SDK independently:
```bash
cd packages/sdk
npm publish
```

---

## 📂 Documentation Archive
All legacy architecture notes, specific technical blueprints, and the original production guides have been consolidated neatly into the `/docs/` folder.
*   [Production Guide](./docs/PRODUCTION_GUIDE.md)
*   [SDK Architecture Drafts](./docs/SEBEVERIFY_SDK_ARCHITECTURE.md)
*   [Original Scaffolding Readme](./docs/OLD_README.md)

---

## 🔮 Roadmap: AI Liveness (Coming Next)
The absolute next step in development is upgrading the final `SelfieCapture` step to include a completely backend-free, in-browser facial AI engine.
*   **Engine:** `Google MediaPipe`
*   **Flow:** "Random Two" Challenge. The user's device will instantly select two random actions (e.g., *Smile*, *Turn Head Right*) and trace their blendshapes locally using 60fps face-tracking to prove biometric liveness.
