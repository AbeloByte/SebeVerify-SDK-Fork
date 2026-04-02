"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { VerificationFlow } from "@/components/verification/verification-flow"
import { useVerificationStore } from "@/lib/verification-store"
import { Loader2 } from "lucide-react"

function VerifyContent() {
  const searchParams = useSearchParams()
  const setSessionId = useVerificationStore((state) => state.setSessionId)
  
  const sessionId = searchParams.get('session')
  const returnUrl = searchParams.get('returnUrl') || searchParams.get('return_url')

  useEffect(() => {
    if (sessionId) {
      setSessionId(sessionId)
    }
  }, [sessionId, setSessionId])

  const handleComplete = () => {
    // In real implementation, this would call the backend to mark session as complete
    // Then redirect or postMessage to parent
    if (returnUrl) {
      window.location.href = `${returnUrl}?status=success&session=${sessionId}`
    }
  }

  const handleClose = () => {
    if (returnUrl) {
      window.location.href = `${returnUrl}?status=cancelled&session=${sessionId}`
    }
  }

  return (
    <VerificationFlow 
      onComplete={handleComplete}
      onClose={handleClose}
      returnUrl={returnUrl || undefined}
    />
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading verification...</p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyContent />
    </Suspense>
  )
}
