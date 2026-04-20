import { create } from 'zustand'
import {
  apiCompleteMockSession,
  apiUpdateMockSession,
  isMockSessionId,
} from '@/lib/mock-api-client'



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
  livenessImages: string[]
  submittedAt: string | null
}

interface VerificationState {
  sessionId: string | null
  currentStep: VerificationStep
  documentType: DocumentType | null
  frontImage: string | null
  backImage: string | null
  selfieImage: string | null
  livenessImages: string[]
  submittedAt: string | null
  errorMessage: string | null

  // Actions
  setSessionId: (id: string) => void
  setStep: (step: VerificationStep) => void
  setDocumentType: (type: DocumentType) => void
  setFrontImage: (image: string) => void
  setBackImage: (image: string) => void
  setSelfieImage: (image: string) => void
  setLivenessImages: (images: string[]) => void
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
  livenessImages: [],
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
    set({ frontImage: image })
    const sid = get().sessionId
    if (isMockSessionId(sid)) {
      void apiUpdateMockSession(sid!, { frontImage: image })
    }
  },

  setBackImage: (image) => {
    set({ backImage: image })
    const sid = get().sessionId
    if (isMockSessionId(sid)) {
      void apiUpdateMockSession(sid!, { backImage: image })
    }
  },

  setSelfieImage: (image) => {
    set({ selfieImage: image })
    const sid = get().sessionId
    if (isMockSessionId(sid)) {
      void apiUpdateMockSession(sid!, { selfieImage: image })
    }
  },

  setLivenessImages: (images) => {
    set({ livenessImages: images })
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
      livenessImages: state.livenessImages,
      submittedAt: state.submittedAt
    }
  },

  submitVerification: async () => {
    set({ currentStep: 'submitting' })
    const state = get()
    let sid = state.sessionId

    try {
      // Force generating a session if manually testing locally, so mock API runs!
      if (!isMockSessionId(sid)) {
        const res = await fetch("/api/mock/session", { method: "POST", headers: { "Content-Type": "application/json" } })
        const json = await res.json()
        sid = json.sessionId
      }

      await apiUpdateMockSession(sid!, {
        documentType: state.documentType ?? undefined,
        frontImage: state.frontImage ?? undefined,
        backImage: state.backImage ?? undefined,
        selfieImage: state.selfieImage ?? undefined,
        livenessImages: state.livenessImages.length > 0 ? state.livenessImages : undefined,
      })
      await apiCompleteMockSession(sid!)
    } catch (e) {
      console.error('Mock submit failed:', e)
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
    livenessImages: [],
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
