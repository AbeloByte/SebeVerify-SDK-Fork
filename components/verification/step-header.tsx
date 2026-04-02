"use client"

import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVerificationStore } from "@/lib/verification-store"

interface StepHeaderProps {
  onClose?: () => void
}

export function StepHeader({ onClose }: StepHeaderProps) {
  const { currentStep, goBack } = useVerificationStore()
  
  const canGoBack = currentStep !== 'intro' && 
    currentStep !== 'success' && 
    currentStep !== 'error' &&
    currentStep !== 'processing'

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="w-10">
        {canGoBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-10 w-10"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 text-primary-foreground"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <span className="font-semibold text-foreground">SebeVerify</span>
      </div>
      
      <div className="w-10">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  )
}
