"use client"

import { useState } from "react"
import { Shield, Code2, Smartphone, Check, ArrowRight, Play, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SebeVerify from "@/lib/sebeverify-sdk"
import Link from "next/link"

export default function HomePage() {
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'started' | 'success' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  const handleStartVerification = () => {
    const sdk = SebeVerify.init({
      apiKey: "pk_demo_xxx",
      redirectUrl: `${window.location.origin}/verify`
    })

    sdk.on("started", () => {
      console.log("[Demo] Verification started")
      setVerificationStatus('started')
    })

    sdk.on("success", (result) => {
      console.log("[Demo] Verification success:", result)
      setVerificationStatus('success')
    })

    sdk.on("error", (error) => {
      console.log("[Demo] Verification error:", error)
      setVerificationStatus('error')
    })

    sdk.on("cancelled", () => {
      console.log("[Demo] Verification cancelled")
      setVerificationStatus('idle')
    })

    sdk.start()
  }

  const codeExample = `import SebeVerify from "@sebeverify/web-sdk"

const sdk = SebeVerify.init({
  apiKey: "pk_live_xxx",
  redirectUrl: "https://verify.sebeverify.com/mobile"
})

sdk.on("success", result => {
  console.log("Verification success:", result)
})

sdk.on("error", error => {
  console.error("Verification failed:", error)
})

sdk.start()`

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const features = [
    {
      icon: Shield,
      title: "Secure Verification",
      description: "End-to-end encrypted document and face verification"
    },
    {
      icon: Smartphone,
      title: "Mobile-First",
      description: "Optimized verification flow for all devices"
    },
    {
      icon: Code2,
      title: "Easy Integration",
      description: "Drop-in SDK with simple event-based API"
    }
  ]

  const steps = [
    "User clicks verification button",
    "QR code modal appears (desktop) or redirects (mobile)",
    "User captures document photos",
    "User takes a selfie",
    "Data is submitted for review",
    "User receives notification when verified"
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
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
            <span className="font-bold text-xl text-foreground">SebeVerify</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link 
              href="/verify" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo Flow
            </Link>
            <Button variant="outline" size="sm">Documentation</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Identity Verification SDK
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Verify Identities with Confidence
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            SebeVerify provides a complete identity verification solution with document scanning, 
            selfie capture, and face matching - all in a simple, embeddable SDK.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="h-12 px-8 text-base"
              onClick={handleStartVerification}
            >
              <Play className="h-4 w-4 mr-2" />
              Try Demo
            </Button>
            <Link href="/verify">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Mobile Flow
              </Button>
            </Link>
          </div>

          {verificationStatus === 'success' && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary">
              <Check className="h-5 w-5" />
              Documents submitted! You will be notified when verification is complete.
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">
            Why Choose SebeVerify?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            A simple 6-step flow that guides users through identity verification
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-medium text-sm">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Code */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-4">
            Quick Integration
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Add identity verification to your app in minutes
          </p>
          
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-foreground/5 border-b border-border py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCode}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-6 overflow-x-auto text-sm">
                <code className="text-foreground">{codeExample}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Integrate SebeVerify into your application and start verifying identities today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8">
              Get API Key
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">SebeVerify</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}
