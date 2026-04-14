# About The Project: SebeVerify

## What is SebeVerify?
SebeVerify is a **KYC (Know Your Customer) and Identity Verification** platform. 

Imagine you are a bank, a crypto exchange, or a marketplace. Before you allow a new user to open an account, you legally need to prove they are a real person and that they are who they say they are. Building a secure system to scan IDs and analyze faces is incredibly expensive and difficult.

**SebeVerify solves this entirely.**
Instead of building it themselves, a business (a "merchant") can simply plug SebeVerify into their website. When a user needs to be verified, SebeVerify takes over, accesses the user's camera, securely scans their Government ID, and performs advanced AI checks to ensure the person is physically holding the camera (and not just showing a printed photo). 

---

## The Two Main Pieces

To make this magic happen, SebeVerify is split into two perfectly connected halves:

1. **The Merchant Web SDK (`packages/sdk`)**
   Think of this as a tiny, invisible "button" or "bridge." The merchant installs this tiny script on their website. It doesn't bloat their website or slow it down. It just waits until the user needs to be verified, and then safely opens the SebeVerify system on top of their website.

2. **The Verification Web App (The Next.js Root)**
   This is the heavy-lifting engine. It is beautifully designed and securely hosted on SebeVerify's own cloud. It handles the complicated camera hardware, takes high-quality pictures, and runs the AI facial analysis.

---

## How It Works: Step-by-Step

Here is the exact journey a user takes when a merchant asks them to verify their identity using SebeVerify:

### Step 1: The Trigger
A user is on a merchant's website (e.g., trying to buy crypto). The merchant needs to verify them, so they trigger the SebeVerify SDK. A secure window opens on the screen.

### Step 2: The "Cross-Device" Handoff (If on Desktop)
Webcams on laptop computers are usually low-quality and very hard to maneuver to take a good picture of an ID card.
* If the user is on a computer, SebeVerify displays a **QR Code** on their screen.
* The user points their smartphone camera at the screen.
* The secure session instantly jumps to their phone, giving SebeVerify access to their high-quality iPhone or Android camera!

### Step 3: Document Selection
The user chooses which type of Government ID they have handy (e.g., a Passport, a National ID Card, or a Driver's License).

### Step 4: ID Capture
SebeVerify securely accesses the camera hardware. 
* It draws an overlay on the screen, guiding the user to perfectly frame the **Front** of their ID.
* The user clicks capture. If it's a Driver's License or National ID, SebeVerify then asks them to flip the card over and capture the **Back**.

### Step 5: The Selfie & Active Liveness Check
Now, SebeVerify needs to prove the person holding the phone actually matches the face on the ID card—and that they are alive!
* The front-facing selfie camera opens.
* The system performs "Active Liveness" checks. It may ask the user to randomly **"Smile"** or **"Turn your head to the left."**
* A powerful AI engine (Google MediaPipe) tracks the user's face in real-time. If it proves the user is a living human following directions (and not a hacker holding up a printed headshot), it captures the selfie.

### Step 6: Secure Handshake & Completion
Behind the scenes, SebeVerify analyzes the ID images and the selfie. It securely packages the data and sends a "Webhook" (a silent digital message) back to the merchant's servers, saying: *"This user exactly matches their ID. They are verified and safe to use your platform."*

The user is then seamlessly redirected back to the merchant's website to continue what they were doing!

---

## How Merchants Integrate SebeVerify

We built the system so that integrating SebeVerify takes a merchant less than 15 minutes. Here is how a business plugs it into their own app:

### 1. Install the SDK
The merchant simply installs our ultra-lightweight library.
* **For Web apps (React/Next.js):** `npm install @sebeverify/web-sdk`
* **For basic HTML:** They just paste a quick `<script>` tag in their website header.

### 2. Add the "Verify" Button
The merchant places a "Verify Identity" button anywhere on their website. When clicked, it calls the `SebeVerify.start()` function using their unique API Key.

```javascript
import SebeVerify from '@sebeverify/web-sdk';

// Automatically launches the secure camera flow overlay
SebeVerify.start({
  merchantKey: "sk_live_123456789",
  onSuccess: function(verificationToken) {
    console.log("User successfully finished the camera flow!", verificationToken);
  }
});
```

### 3. Listen for the Secure Webhook
Because the frontend browser can theoretically be tampered with by hackers, a merchant shouldn't blindly trust the website. 
To guarantee security, once the user finishes taking photos, SebeVerify's heavily secured Cloud Server analyzes the face and sends a silent "Webhook" (an automated data packet) directly to the **Merchant's Secure Server** containing the true, verified ID data. 

That allows the merchant's server to safely unfreeze the crypto account, approve the loan, or activate the user profile entirely behind the scenes!
