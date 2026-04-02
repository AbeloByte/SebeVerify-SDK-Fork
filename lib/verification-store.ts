import { create } from 'zustand'

export type VerificationStep = 
  | 'intro' 
  | 'doc-select' 
  | 'id-front' 
  | 'id-back' 
  | 'review' 
  | 'selfie' 
  | 'submitting'
  | 'submitted' 
  | 'error'

export type DocumentType = 'passport' | 'national_id' | 'driver_license'

export interface VerificationData {
  sessionId: string | null
  documentType: DocumentType | null
  frontImage: string | null
  backImage: string | null
  selfieImage: string | null
  submittedAt: string | null
}

interface VerificationState {
  sessionId: string | null
  currentStep: VerificationStep
  documentType: DocumentType | null
  frontImage: string | null
  backImage: string | null
  selfieImage: string | null
  submittedAt: string | null
  errorMessage: string | null
  
  // Actions
  setSessionId: (id: string) => void
  setStep: (step: VerificationStep) => void
  setDocumentType: (type: DocumentType) => void
  setFrontImage: (image: string) => void
  setBackImage: (image: string) => void
  setSelfieImage: (image: string) => void
  setError: (message: string) => void
  getVerificationData: () => VerificationData
  submitVerification: () => Promise<void>
  reset: () => void
  goBack: () => void
}

const stepOrder: VerificationStep[] = [
  'intro',
  'doc-select',
  'id-front',
  'id-back',
  'review',
  'selfie',
  'submitting',
  'submitted'
]

export const useVerificationStore = create<VerificationState>((set, get) => ({
  sessionId: null,
  currentStep: 'intro',
  documentType: null,
  frontImage: null,
  backImage: null,
  selfieImage: null,
  submittedAt: null,
  errorMessage: null,

  setSessionId: (id) => set({ sessionId: id }),
  
  setStep: (step) => set({ currentStep: step }),
  
  setDocumentType: (type) => set({ documentType: type }),
  
  setFrontImage: (image) => set({ frontImage: image }),
  
  setBackImage: (image) => set({ backImage: image }),
  
  setSelfieImage: (image) => set({ selfieImage: image }),
  
  setError: (message) => set({ errorMessage: message, currentStep: 'error' }),

  getVerificationData: () => {
    const state = get()
    return {
      sessionId: state.sessionId,
      documentType: state.documentType,
      frontImage: state.frontImage,
      backImage: state.backImage,
      selfieImage: state.selfieImage,
      submittedAt: state.submittedAt
    }
  },

  submitVerification: async () => {
    set({ currentStep: 'submitting' })
    
    // Store the data locally for now
    // TODO: Send to backend when endpoint is ready
    // const state = get()
    // const response = await fetch('/api/verify', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     sessionId: state.sessionId,
    //     documentType: state.documentType,
    //     frontImage: state.frontImage,
    //     backImage: state.backImage,
    //     selfieImage: state.selfieImage
    //   })
    // })
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const submittedAt = new Date().toISOString()
    set({ submittedAt, currentStep: 'submitted' })
  },
  
  reset: () => set({
    sessionId: null,
    currentStep: 'intro',
    documentType: null,
    frontImage: null,
    backImage: null,
    selfieImage: null,
    submittedAt: null,
    errorMessage: null
  }),

  goBack: () => {
    const { currentStep, documentType } = get()
    const currentIndex = stepOrder.indexOf(currentStep)
    
    if (currentIndex > 0) {
      // Skip id-back for passport
      if (currentStep === 'review' && documentType === 'passport') {
        set({ currentStep: 'id-front' })
      } else {
        set({ currentStep: stepOrder[currentIndex - 1] })
      }
    }
  }
}))
