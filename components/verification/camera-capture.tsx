"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Camera, RotateCcw, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onRetake?: () => void
  capturedImage?: string | null
  title: string
  instructions: string
  overlayType?: 'document' | 'selfie'
}

export function CameraCapture({
  onCapture,
  onRetake,
  capturedImage,
  title,
  instructions,
  overlayType = 'document'
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    overlayType === 'selfie' ? 'user' : 'environment'
  )

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true)
        }
      }
      setStream(mediaStream)
    } catch (err) {
      console.error('[v0] Camera error:', err)
      const error = err as Error
      if (error.name === 'AbortError' || error.message?.includes('Timeout')) {
        setError('Camera took too long to start. Please close other apps using the camera and try again.')
      } else if (error.name === 'NotAllowedError') {
        setError('Camera access was denied. Please allow camera permissions in your browser settings.')
      } else if (error.name === 'NotFoundError') {
        setError('No camera found on this device. Please use a device with a camera.')
      } else {
        setError('Unable to access camera. Please ensure camera permissions are granted and try again.')
      }
    }
  }, [facingMode, stream])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsReady(false)
  }, [stream])

  useEffect(() => {
    if (!capturedImage) {
      startCamera()
    }
    
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage, facingMode])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Flip horizontally for selfie mode
    if (facingMode === 'user') {
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
    }
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    onCapture(imageData)
    stopCamera()
  }, [facingMode, onCapture, stopCamera])

  const handleRetake = () => {
    onRetake?.()
    startCamera()
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground">{instructions}</p>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Camera Access Required</h2>
          <p className="text-center text-muted-foreground mb-6 max-w-sm">{error}</p>
          <Button onClick={startCamera} size="lg" className="h-12 px-8">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Camera
          </Button>
          <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
            Tip: Make sure no other apps are using your camera
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">{instructions}</p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 rounded-2xl overflow-hidden bg-foreground/5 min-h-[300px]">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "absolute inset-0 w-full h-full object-cover",
                  facingMode === 'user' && "scale-x-[-1]"
                )}
              />
              
              {/* Overlay guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {overlayType === 'document' ? (
                  <div className="w-[85%] aspect-[1.6] border-2 border-dashed border-primary/50 rounded-lg" />
                ) : (
                  <div className="w-48 h-48 border-2 border-dashed border-primary/50 rounded-full" />
                )}
              </div>
            </>
          )}
          
          {/* Camera toggle button */}
          {!capturedImage && overlayType !== 'selfie' && (
            <button
              onClick={toggleCamera}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center text-background"
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
                onClick={handleRetake}
                variant="outline"
                className="flex-1 h-12"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={() => onCapture(capturedImage)}
                className="flex-1 h-12"
              >
                <Check className="h-4 w-4 mr-2" />
                Use Photo
              </Button>
            </div>
          ) : (
            <Button
              onClick={captureImage}
              disabled={!isReady}
              className="w-full h-12"
              size="lg"
            >
              <Camera className="h-5 w-5 mr-2" />
              {isReady ? 'Capture' : 'Starting Camera...'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
