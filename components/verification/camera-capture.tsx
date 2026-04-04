"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Camera, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onRetake?: () => void
  capturedImage?: string | null
  title: string
  instructions: string
  overlayType?: "document" | "selfie"
}

export function CameraCapture({
  onCapture,
  onRetake,
  capturedImage,
  title,
  instructions,
  overlayType = "document",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    overlayType === "selfie" ? "user" : "environment"
  )

  const stopCamera = useCallback(() => {
    setStream((prev) => {
      if (prev) {
        prev.getTracks().forEach((track) => track.stop())
      }
      return null
    })
    setIsReady(false)
  }, [])

  const startCamera = useCallback(
    async (overrideFacing?: "user" | "environment") => {
      const mode = overrideFacing ?? facingMode
      try {
        setError(null)

        if (typeof window !== "undefined" && !window.isSecureContext) {
          setError(
            "Camera needs a secure connection (HTTPS). On your phone, open the app URL over HTTPS (e.g. ngrok or your deployed site), or use USB debugging with localhost — plain http:// to a LAN IP is blocked by browsers for camera access."
          )
          return
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          setError(
            "Camera is not available in this browser. Try Safari or Chrome, allow permissions, and use HTTPS if you are not on localhost."
          )
          return
        }

        setStream((prev) => {
          if (prev) {
            prev.getTracks().forEach((track) => track.stop())
          }
          return null
        })

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode } },
          audio: false,
        })

        // Just set the stream! The useEffect will catch it and attach it to the video element.
        setStream(mediaStream)
      } catch (err) {
        console.error("Camera error:", err)
        const e = err as Error
        if (e.name === "AbortError" || e.message?.includes("Timeout")) {
          setError(
            "Camera took too long to start. Please close other apps using the camera and try again."
          )
        } else if (e.name === "NotAllowedError") {
          setError(
            "Camera access was denied. Tap “Allow camera” again and choose Allow in the browser prompt, or enable camera in site settings."
          )
        } else if (e.name === "NotFoundError") {
          setError("No camera found on this device. Please use a device with a camera.")
        } else {
          setError(
            `Unable to access camera (${e.name}: ${e.message}). Please ensure camera permissions are granted and try again.`
          )
        }
      }
    },
    [facingMode]
  )

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // React Lifecycle Fix: Bind stream to video AFTER it mounts
  useEffect(() => {
    if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream
      videoRef.current.onloadedmetadata = () => setIsReady(true)
      videoRef.current.onplay = () => setIsReady(true)
      videoRef.current.play().catch(console.error)
    }
  }, [stream])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (facingMode === "user") {
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    onCapture(imageData)
    stopCamera()
  }, [facingMode, onCapture, stopCamera])

  const handleRetake = () => {
    onRetake?.()
    void startCamera()
  }

  const toggleCamera = () => {
    const next = facingMode === "user" ? "environment" : "user"
    setFacingMode(next)
    void startCamera(next)
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 px-6 py-6">
        <div className="mb-6">
          <h1 className="mb-2 text-xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{instructions}</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <Camera className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Camera Access Required</h2>
          <p className="mb-6 max-w-sm text-center text-muted-foreground">{error}</p>
          <Button type="button" onClick={() => void startCamera()} size="lg" className="h-12 px-8">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Camera
          </Button>
          <p className="mt-4 max-w-xs text-center text-xs text-muted-foreground">
            Tip: Make sure no other apps are using your camera
          </p>
        </div>
      </div>
    )
  }

  const [hasAutoStarted, setHasAutoStarted] = useState(false)

  useEffect(() => {
    if (!hasAutoStarted && !capturedImage) {
      setHasAutoStarted(true)
      void startCamera()
    }
  }, [hasAutoStarted, capturedImage, startCamera])

  return (
    <div className="flex flex-col flex-1 px-6 py-6">
      <div className="mb-4">
        <h1 className="mb-2 text-xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{instructions}</p>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-2xl bg-foreground/5">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "absolute inset-0 h-full w-full object-cover",
                  facingMode === "user" && "scale-x-[-1]"
                )}
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {overlayType === "document" ? (
                  <div className="aspect-[1.6] w-[85%] rounded-lg border-2 border-dashed border-primary/50" />
                ) : (
                  <div className="h-48 w-48 rounded-full border-2 border-dashed border-primary/50" />
                )}
              </div>
            </>
          )}

          {!capturedImage && overlayType !== "selfie" && (
            <button
              type="button"
              onClick={toggleCamera}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/20 text-background backdrop-blur-sm touch-manipulation"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-6 space-y-3">
          {capturedImage ? (
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleRetake}
                variant="outline"
                className="h-12 flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button
                type="button"
                onClick={() => onCapture(capturedImage)}
                className="h-12 flex-1"
              >
                <Check className="mr-2 h-4 w-4" />
                Use Photo
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={captureImage}
              disabled={!isReady}
              className="h-12 w-full"
              size="lg"
            >
              <Camera className="mr-2 h-5 w-5" />
              {isReady ? "Capture" : "Starting camera…"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
