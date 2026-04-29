import { create } from 'zustand'
import {
  apiCompleteMockSession,
  apiUpdateMockSession,
  isMockSessionId,
  isProductionSessionId,
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

  // SDK config (can be set externally)
  backendUrl: string | null
  sessionToken: string | null

  // Actions
  setSessionId: (id: string) => void
  setStep: (step: VerificationStep) => void
  setDocumentType: (type: DocumentType) => void
  setFrontImage: (image: string) => void
  setBackImage: (image: string) => void
  setSelfieImage: (image: string) => void
  setLivenessImages: (images: string[]) => void
  setError: (message: string) => void
  setApiConfig: (config: { backendUrl?: string; sessionToken?: string }) => void
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
  backendUrl: null,
  sessionToken: null,

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

  setApiConfig: ({ backendUrl, sessionToken }) => {
    set({ backendUrl: backendUrl || null, sessionToken: sessionToken || null })
  },

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

    const isProduction = isProductionSessionId(sid) && Boolean(state.backendUrl && state.sessionToken)

    if (isProduction && state.backendUrl && state.sessionToken) {
      const sessionToken = state.sessionToken
      try {
        const formData = new FormData()
        formData.append('document_type', state.documentType || 'national_id')
        formData.append('document_id', 'ID-' + Date.now())

        if (state.frontImage) {
          const frontBlob = dataURLtoBlob(state.frontImage)
          formData.append('document_image', frontBlob, 'front.jpg')
        }

        if (state.selfieImage) {
          const selfieBlob = dataURLtoBlob(state.selfieImage)
          formData.append('person_image', selfieBlob, 'selfie.jpg')
        }

        if (state.backImage) {
          const backBlob = dataURLtoBlob(state.backImage)
          formData.append('document_image_back', backBlob, 'back.jpg')
        }

        const uploadRes = await fetch(`${state.backendUrl}/v1/sessions/${sid}/upload`, {
          method: 'POST',
          headers: { 'X-Session-Token': sessionToken },
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error('Failed to upload images')
        }

        const completeRes = await fetch(`${state.backendUrl}/v1/sessions/${sid}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': sessionToken,
          },
          body: JSON.stringify({
            document_type: state.documentType || 'national_id',
            document_id: 'ID-' + Date.now(),
            front_image: state.frontImage,
            back_image: state.backImage,
            selfie_image: state.selfieImage,
            liveness_images: state.livenessImages,
          }),
        })

        if (!completeRes.ok) {
          throw new Error('Failed to complete session')
        }

        const completeBody = await completeRes.json() as { success?: boolean; message?: string }
        if (!completeBody.success) {
          throw new Error(completeBody.message || 'Verification submission failed')
        }
      } catch (e) {
        console.error('Production submit failed:', e)
        set({ errorMessage: 'Verification submission failed', currentStep: 'error' })
        return
      }
    } else {
      try {
        if (!isMockSessionId(sid)) {
          const res = await fetch("/api/mock/session", { method: "POST", headers: { "Content-Type": "application/json" } })
          const json = await res.json()
          sid = json.sessionId
          set({ sessionId: sid })
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
    errorMessage: null,
    backendUrl: null,
    sessionToken: null,
  }),

  goBack: () => {
    const { currentStep, documentType } = get()
    const currentIndex = stepOrder.indexOf(currentStep)

    if (currentIndex > 0) {
      if (currentStep === 'review' && documentType === 'passport') {
        set({ currentStep: 'id-front' })
      } else {
        set({ currentStep: stepOrder[currentIndex - 1] })
      }
    }
  }
}))

function dataURLtoBlob(dataURL: string): Blob {
  const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '')
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: 'image/jpeg' })
}
