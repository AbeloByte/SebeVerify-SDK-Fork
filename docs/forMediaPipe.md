# Google MediaPipe Integration: Active Liveness Engine

This document outlines the exact architecture and implementation strategy for adding **Active Liveness Validation** to the SebeVerify platform using `Google MediaPipe`.

By running the AI directly in the user's browser, SebeVerify avoids heavy server costs and eliminates the latency of sending live video to a backend.

---

## 1. What is MediaPipe?
Google MediaPipe (`@mediapipe/tasks-vision`) is a state-of-the-art AI library that runs incredibly fast inside a standard web browser using WebAssembly and WebGL. 
We will use its **Face Landmarker** engine to track 478 points on the user's face at 60 FPS in real-time, allowing us to mathematically prove the user is alive.

## 2. The "Random Two" Architecture
To prevent hackers from using pre-recorded videos or holding up a printed photo, SebeVerify will use the **"Random Two" Challenge** pattern during the final `<SelfieCapture>` step.

**The Workflow:**
1. The camera opens and detects exactly 1 face.
2. The UI randomly selects **two** actions from a pool (e.g., *Smile*, *Turn Head Left*, *Turn Head Right*, *Blink*).
3. The UI prompts the user: *"Please Smile"*
4. Real-time MediaPipe logic scans the face. Once the user smiles, UI updates: *"Great! Now turn your head left."*
5. Once the second challenge passes, the camera instantly snaps the selfie photo and marks the user as **LIVENESS: VERIFIED**.

---

## 3. How to Implement It (Step-by-Step)

### Step 1: Install Dependencies
Run this in the root Next.js workspace to install the official Google AI layers:
```bash
pnpm add @mediapipe/tasks-vision
```

### Step 2: Download the AI Model Asset
MediaPipe requires an ultra-lightweight `.task` file (the AI brain) to run. 
You will download `face_landmarker.task` from Google's official developer site and place it in the `public/models/` folder of the Next.js app so the browser can fetch it instantly.

### Step 3: The React Hook (`useMediaPipe.ts`)
You will create a custom React Hook that initializes the `FaceLandmarker` worker thread.
```typescript
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export async function initLivenessEngine() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  
  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/face_landmarker.task", // Your local file
      delegate: "GPU"
    },
    outputFaceBlendshapes: true, // IMPORTANT: We need this to detect smiles!
    runningMode: "VIDEO",
    numFaces: 1 // Reject if multiple people are in the frame
  });

  return landmarker;
}
```

### Step 4: Hooking it into `SelfieCapture.tsx`
Inside your selfie component, you will map the `<video>` HTML element directly into the AI engine. You run it on a continuous loop using `requestAnimationFrame`.

```typescript
// Example Loop Logic inside SelfieCapture
const analyzeFrame = () => {
    if (!videoRef.current || !landmarker) return;

    // The AI analyzes the current video frame
    const results = landmarker.detectForVideo(videoRef.current, performance.now());

    if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        const shapes = results.faceBlendshapes[0].categories;
        
        // Example: Check if the user is Smiling!
        const smileLeft = shapes.find(s => s.categoryName === "mouthSmileLeft")?.score || 0;
        const smileRight = shapes.find(s => s.categoryName === "mouthSmileRight")?.score || 0;
        
        if (smileLeft > 0.6 && smileRight > 0.6) {
           setCurrentChallenge("turn_left"); // Pass! Move to next challenge
        }
    }
    
    // Call the loop again for the next frame
    requestAnimationFrame(analyzeFrame);
};
```

---

## 4. Challenge Algorithms
By reading the `faceBlendshapes` matrix returned by MediaPipe, we can easily calculate any facial expression.

1. **Smile:** Look for `mouthSmileLeft` > 0.6 and `mouthSmileRight` > 0.6.
2. **Blink:** Look for `eyeBlinkLeft` > 0.5 and `eyeBlinkRight` > 0.5 simultaneously.
3. **Turn Head Left/Right:** MediaPipe provides a spatial transform matrix. Look at the `facialTransformationMatrixes` to calculate the Yaw (Euler Angle Y). If it exceeds 30 degrees, they turned their head.

By implementing this, SebeVerify achieves enterprise-grade, unbreakable liveness detection without paying backend processing fees!
