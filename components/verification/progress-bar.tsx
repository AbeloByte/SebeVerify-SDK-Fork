"use client"

import { cn } from "@/lib/utils"
import type { VerificationStep } from "@/lib/verification-store"

interface ProgressBarProps {
  currentStep: VerificationStep
}

const steps: { key: VerificationStep; label: string }[] = [
  { key: 'doc-select', label: 'Document' },
  { key: 'id-front', label: 'Front' },
  { key: 'id-back', label: 'Back' },
  { key: 'selfie', label: 'Selfie' },
  { key: 'submitting', label: 'Submit' },
]

const stepOrder: VerificationStep[] = [
  'intro',
  'doc-select',
  'id-front',
  'id-back',
  'review',
  'selfie',
  'submitting',
  'submitted',
  'error'
]

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentIndex = stepOrder.indexOf(currentStep)
  
  if (currentStep === 'intro' || currentStep === 'submitted' || currentStep === 'error') {
    return null
  }

  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center justify-between gap-1">
        {steps.map((step, index) => {
          const stepIndex = stepOrder.indexOf(step.key)
          const isCompleted = currentIndex > stepIndex
          const isCurrent = currentIndex === stepIndex || 
            (step.key === 'id-front' && currentStep === 'review')
          
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    isCompleted || isCurrent ? "bg-primary" : "bg-muted"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-xs mt-1.5 font-medium transition-colors",
                  isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
