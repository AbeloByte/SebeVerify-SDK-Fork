import { useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export function useMediaPipe() {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initLivenessEngine = useCallback(async () => {
    // Prevent multiple initializations
    if (landmarker || isInitializing) return;

    try {
      setIsInitializing(true);
      setError(null);

      // Load MediaPipe WASM binaries from CDN
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Initialize FaceLandmarker using local task file
      const newLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/face_landmarker.task",
          delegate: "CPU" // Mobile uses CPU (XNNPACK) anyway — setting explicitly avoids GPU warnings
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true, // Needed for Turn Head challenges
        runningMode: "VIDEO",
        numFaces: 1 // We only allow 1 face for liveness security
      });

      setLandmarker(newLandmarker);
    } catch (err: any) {
      console.error("Failed to initialize MediaPipe FaceLandmarker:", err);
      setError(err);
    } finally {
      setIsInitializing(false);
    }
  }, [landmarker, isInitializing]);

  return { landmarker, initLivenessEngine, isInitializing, error };
}
