import { create } from 'zustand'
import {
  apiCompleteMockSession,
  apiUpdateMockSession,
  isMockSessionId,
} from '@/lib/mock-api-client'

const MOCK_PLACEHOLDER_IMAGES = {
  front: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=", // Empty transparent SVG as mock
  back: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=",
  selfie: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=",
}

export type VerificationStep = 
  | 'intro' 
  | 'doc-select' 
  | 'id-camera-prep'
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
  'id-camera-prep',
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
  
  setDocumentType: (type) => {
    set({ documentType: type })
    const sid = get().sessionId
    if (isMockSessionId(sid)) {
      void apiUpdateMockSession(sid!, { documentType: type })
    }
  },

  setFrontImage: (image) => {
    const sid = get().sessionId
    if (isMockSessionId(sid)) {
      const path = MOCK_PLACEHOLDER_IMAGES.front
      set({ frontImage: path })
      void apiUpdateMockSession(sid!, { frontImage: path })
    } else {
      set({ frontImage: image })
    }
  },

  setBackImage: (image) => {
    const sid = get().sessionId
    if (isMockSessionId(sid)) {
      const path = MOCK_PLACEHOLDER_IMAGES.back
      set({ backImage: path })
      void apiUpdateMockSession(sid!, { backImage: path })
    } else {
      set({ backImage: image })
    }
  },

  setSelfieImage: (image) => {
    const sid = get().sessionId
    if (isMockSessionId(sid)) {
      const path = MOCK_PLACEHOLDER_IMAGES.selfie
      set({ selfieImage: path })
      void apiUpdateMockSession(sid!, { selfieImage: path })
    } else {
      set({ selfieImage: image })
    }
  },
  
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
    const state = get()

    if (isMockSessionId(state.sessionId)) {
      try {
        await apiUpdateMockSession(state.sessionId!, {
          documentType: state.documentType ?? undefined,
          frontImage: state.frontImage ?? undefined,
          backImage: state.backImage ?? undefined,
          selfieImage: state.selfieImage ?? undefined,
        })
        await apiCompleteMockSession(state.sessionId!)
      } catch (e) {
        console.error('Mock submit failed:', e)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, state.sessionId ? 400 : 2000))

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
