"use client"

import { CreditCard, BookOpen, Car, ChevronRight } from "lucide-react"
import { useVerificationStore } from "@/lib/verification-store"
import type { DocumentType } from "@/lib/verification-store"
import { cn } from "@/lib/utils"

const documentTypes: { type: DocumentType; label: string; icon: typeof CreditCard; description: string }[] = [
  {
    type: 'national_id',
    label: 'National ID Card',
    icon: CreditCard,
    description: 'Government-issued national identity card'
  },
  {
    type: 'passport',
    label: 'Passport',
    icon: BookOpen,
    description: 'International travel document'
  }
]

export function DocumentTypeSelector() {
  const { documentType, setDocumentType, setStep } = useVerificationStore()

  const handleSelect = (type: DocumentType) => {
    setDocumentType(type)
    setStep('id-camera-prep')
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-2">
          Select Document Type
        </h1>
        <p className="text-muted-foreground">
          Choose the type of document you want to use for verification
        </p>
      </div>

      <div className="space-y-3">
        {documentTypes.map((doc) => (
          <button
            key={doc.type}
            onClick={() => handleSelect(doc.type)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
              "hover:border-primary hover:bg-primary/5",
              documentType === doc.type
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            )}
          >
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <doc.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground">{doc.label}</h3>
              <p className="text-sm text-muted-foreground truncate">{doc.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <p className="text-xs text-center text-muted-foreground">
          Make sure your document is valid and not expired
        </p>
      </div>
    </div>
  )
}
