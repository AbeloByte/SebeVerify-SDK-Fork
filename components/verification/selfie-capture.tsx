"use client"

import { useState } from "react"
import { CameraCapture } from "./camera-capture"
import { useVerificationStore } from "@/lib/verification-store"

export function SelfieCapture() {
  const { setSelfieImage, submitVerification } = useVerificationStore()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const handleCapture = async (imageData: string) => {
    if (capturedImage) {
      // User confirmed the image - save and submit
      setSelfieImage(imageData)
      await submitVerification()
    } else {
      // First capture, show preview
      setCapturedImage(imageData)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
  }

  return (
    <CameraCapture
      title="Take a Selfie"
      instructions="Position your face within the circle. Ensure good lighting and remove any glasses or hats."
      onCapture={handleCapture}
      onRetake={handleRetake}
      capturedImage={capturedImage}
      overlayType="selfie"
    />
  )
}
