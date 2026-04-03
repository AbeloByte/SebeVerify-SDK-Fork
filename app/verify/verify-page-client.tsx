"use client"

import { useEffect, useState } from "react"
import { VerificationFlow } from "@/components/verification/verification-flow"
import { useVerificationStore } from "@/lib/verification-store"

function readQuery() {
  if (typeof window === "undefined")
    return { session: null as string | null, returnUrl: null as string | null }
  const params = new URLSearchParams(window.location.search)
  return {
    session: params.get("session"),
    returnUrl: params.get("returnUrl") || params.get("return_url"),
  }
}

type VerifyPageClientProps = {
  /** From `/verify/[sessionId]` — preferred over `?session=` */
  sessionIdFromPath?: string
}

export function VerifyPageClient({ sessionIdFromPath }: VerifyPageClientProps) {
  const [sessionId, setSessionIdState] = useState<string | null>(sessionIdFromPath ?? null)
  const [returnUrl, setReturnUrl] = useState<string | null>(null)
  const setSessionId = useVerificationStore((state) => state.setSessionId)

  useEffect(() => {
    const { session, returnUrl: r } = readQuery()
    const sid = sessionIdFromPath || session
    setSessionIdState(sid)
    setReturnUrl(r)
    if (sid) {
      setSessionId(sid)
    }
  }, [sessionIdFromPath, setSessionId])

  const handleComplete = () => {
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
