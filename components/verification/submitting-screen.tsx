"use client"

import { Loader2, Upload } from "lucide-react"

export function SubmittingScreen() {
  const steps = [
    { label: 'Uploading documents...', delay: 0 },
    { label: 'Encrypting your data...', delay: 800 },
    { label: 'Submitting for review...', delay: 1600 },
  ]

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-8">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <div className="relative">
          <Upload className="h-8 w-8 text-primary" />
          <Loader2 className="h-5 w-5 text-primary animate-spin absolute -bottom-1 -right-1" />
        </div>
      </div>
      
      <h1 className="text-xl font-bold text-foreground mb-2 text-center">
        Submitting Your Verification
      </h1>
      
      <p className="text-muted-foreground text-center mb-8">
        Please wait while we securely upload your data...
      </p>

      <div className="w-full max-w-xs space-y-3">
        {steps.map((step) => (
          <SubmittingStep key={step.label} label={step.label} delay={step.delay} />
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground mt-8 max-w-xs">
        Your data is being encrypted and securely transmitted.
      </p>
    </div>
  )
}

function SubmittingStep({ label, delay }: { label: string; delay: number }) {
  return (
    <div 
      className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
