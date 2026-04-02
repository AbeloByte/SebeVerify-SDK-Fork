"use client"

import { Shield, FileCheck, Camera, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVerificationStore } from "@/lib/verification-store"

export function IntroScreen() {
  const setStep = useVerificationStore((state) => state.setStep)

  const features = [
    {
      icon: FileCheck,
      title: "Document Verification",
      description: "Upload your government-issued ID"
    },
    {
      icon: Camera,
      title: "Selfie Capture",
      description: "Take a quick photo of yourself"
    },
    {
      icon: UserCheck,
      title: "Face Matching",
      description: "We verify your identity securely"
    }
  ]

  return (
    <div className="flex flex-col flex-1 px-6 py-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Verify Your Identity
        </h1>
        
        <p className="text-muted-foreground mb-8 max-w-sm">
          Complete a quick verification to confirm your identity. This process takes about 2 minutes.
        </p>

        <div className="w-full max-w-sm space-y-4 mb-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border text-left"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => setStep('doc-select')}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          Start Verification
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          {" "}and{" "}
          <a href="#" className="text-primary hover:underline">Terms of Service</a>
        </p>
      </div>
    </div>
  )
}
