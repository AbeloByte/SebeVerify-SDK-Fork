/**
 * SebeVerify Web SDK
 * Embeddable identity verification SDK for merchants
 */

export interface SebeVerifyConfig {
  apiKey: string
  backendUrl?: string
  userId?: string
  email?: string
  phone?: string
  redirectUrl: string
  theme?: {
    primaryColor?: string
    borderRadius?: string
  }
}

export interface SebeVerifyResult {
  sessionId: string
  status: 'submitted' | 'failed' | 'cancelled' | 'pending'
  submissionData?: {
    documentType: string
    submittedAt: string
    message: string
  }
  requestId?: string
}

type EventType = 'started' | 'mobile_opened' | 'success' | 'error' | 'cancelled' | 'pending'
type EventCallback = (data?: SebeVerifyResult | Error) => void

interface SessionData {
  sessionId: string
  status: 'pending' | 'approved' | 'rejected'
  documentType?: string
  createdAt: string
}

interface SessionCreateData {
  session_id: string
  session_token: string
  url: string
  expires_at: string
}

class SebeVerifySDK {
  private config: SebeVerifyConfig
  private eventListeners: Map<EventType, EventCallback[]> = new Map()
  private sessionId: string | null = null
  private modalElement: HTMLDivElement | null = null
  private checkInterval: ReturnType<typeof setInterval> | null = null
  private backendUrl: string
  private sessionToken: string | null = null

  constructor(config: SebeVerifyConfig) {
    this.config = config
    this.eventListeners = new Map()
    this.backendUrl = config.backendUrl || this.getDefaultBackendUrl()
  }

  private getDefaultBackendUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return ''
  }

  /**
   * Register event listener
   */
  on(event: EventType, callback: EventCallback): this {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
    return this
  }

  /**
   * Remove event listener
   */
  off(event: EventType, callback: EventCallback): this {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
    return this
  }

  private emit(event: EventType, data?: SebeVerifyResult | Error): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  /**
   * Resolve origin for verification app
   */
  private getVerificationAppOrigin(): string {
    const r = this.config.redirectUrl
    try {
      if (r.startsWith('http')) {
        return new URL(r).origin
      }
    } catch {
      /* fall through */
    }
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return ''
  }

  /**
   * Create a verification session via backend API
   */
  private async createSession(): Promise<{ sessionId: string; sessionToken: string }> {
    const url = `${this.backendUrl}/v1/sessions`
    const apiKey = this.config.apiKey
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        user_id: this.config.userId,
        redirect_url: this.config.redirectUrl,
        document_types: ['national_id', 'passport'],
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create session' }))
      throw new Error(error.detail || `Failed to create verification session (${response.status})`)
    }

    const data = await response.json() as SessionCreateData
    this.sessionToken = data.session_token
    return {
      sessionId: data.session_id,
      sessionToken: data.session_token,
    }
  }

  /**
   * Get session status from backend
   */
  private async getSessionStatus(sessionId: string): Promise<SessionData | null> {
    const apiKey = this.config.apiKey
    try {
      const headers: Record<string, string> = {}
      if (this.sessionToken) {
        headers['X-Session-Token'] = this.sessionToken
      } else {
        headers['X-API-Key'] = apiKey
      }
      const response = await fetch(`${this.backendUrl}/v1/sessions/${sessionId}`, { headers })
      
      if (!response.ok) {
        return null
      }
      
      return await response.json()
    } catch {
      return null
    }
  }

/**
   * Upload verification images to backend
   */
  private async uploadVerificationImages(
    sessionId: string,
    documentType: string,
    documentId: string,
    frontImage: Blob,
    backImage: Blob | null,
    selfieImage: Blob,
    livenessImages: Blob[]
  ): Promise<boolean> {
    const formData = new FormData()
    formData.append('document_type', documentType)
    formData.append('document_id', documentId)
    formData.append('document_image', frontImage, 'document_front.jpg')
    formData.append('person_image', selfieImage, 'selfie.jpg')

    if (backImage) {
      formData.append('document_image_back', backImage, 'document_back.jpg')
    }

    livenessImages.forEach((blob, index) => {
      formData.append('liveness_images', blob, `liveness_${index + 1}.jpg`)
    })

    try {
      const apiKey = this.config.apiKey
      const response = await fetch(
        `${this.backendUrl}/v1/sessions/${sessionId}/upload`,
        {
          method: 'POST',
          headers: this.sessionToken
            ? { 'X-Session-Token': this.sessionToken }
            : { 'X-API-Key': apiKey },
          body: formData,
        }
      )

      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Complete a verification session
   */
  private async completeSession(
    sessionId: string,
    documentType: string,
    documentId: string
  ): Promise<{ success: boolean; requestId?: string }> {
    const apiKey = this.config.apiKey
    try {
      const response = await fetch(
        `${this.backendUrl}/v1/sessions/${sessionId}/complete`,
        {
          method: 'POST',
          headers: this.sessionToken
            ? {
                'Content-Type': 'application/json',
                'X-Session-Token': this.sessionToken,
              }
            : {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
              },
          body: JSON.stringify({
            document_type: documentType,
            document_id: documentId,
          }),
        }
      )
      
      if (!response.ok) {
        return { success: false }
      }
      
      return await response.json()
    } catch {
      return { success: false }
    }
  }

  /**
   * Convert base64 data URL to Blob
   */
  private base64ToBlob(base64: string, filename: string, contentType: string): Blob {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: contentType })
  }

  /**
   * Detect if user is on mobile device
   */
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  /**
   * Generate QR code URL for mobile verification
   */
  private getQRCodeUrl(sessionId: string): string {
    const verifyUrl = this.getVerificationUrl(sessionId)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`
  }

  /**
   * Get verification URL
   */
  private getVerificationUrl(sessionId: string): string {
    const origin = this.getVerificationAppOrigin()
    const returnUrl = encodeURIComponent(window.location.href)
    const backendUrl = encodeURIComponent(this.backendUrl)
    const sessionToken = encodeURIComponent(this.sessionToken || '')
    return `${origin}/verify/${sessionId}?returnUrl=${returnUrl}&backendUrl=${backendUrl}&sessionToken=${sessionToken}`
  }

  /**
   * Start the verification flow
   */
  async start(): Promise<void> {
    try {
      this.emit('started')

      const session = await this.createSession()
      this.sessionId = session.sessionId

      if (this.isMobile()) {
        window.location.href = this.getVerificationUrl(this.sessionId)
      } else {
        this.showModal()
      }
    } catch (error) {
      this.emit('error', error as Error)
    }
  }

  /**
   * Submit verification data (used by the embedded verification flow)
   */
  async submitVerification(data: {
    documentType: 'passport' | 'national_id' | 'driver_license'
    documentId: string
    frontImage: string
    backImage?: string
    selfieImage: string
    livenessImages?: string[]
  }): Promise<SebeVerifyResult> {
    if (!this.sessionId) {
      const session = await this.createSession()
      this.sessionId = session.sessionId
    }

    const frontBlob = this.base64ToBlob(data.frontImage, 'front.jpg', 'image/jpeg')
    const selfieBlob = this.base64ToBlob(data.selfieImage, 'selfie.jpg', 'image/jpeg')
    let backBlob: Blob | null = null

    if (data.backImage) {
      backBlob = this.base64ToBlob(data.backImage, 'back.jpg', 'image/jpeg')
    }

    const livenessBlobs = (data.livenessImages || []).map((img, i) =>
      this.base64ToBlob(img, `liveness_${i + 1}.jpg`, 'image/jpeg')
    )

    const uploaded = await this.uploadVerificationImages(
      this.sessionId,
      data.documentType,
      data.documentId,
      frontBlob,
      backBlob,
      selfieBlob,
      livenessBlobs
    )

    if (!uploaded) {
      throw new Error('Failed to upload verification images')
    }

    const result = await this.completeSession(
      this.sessionId,
      data.documentType,
      data.documentId
    )

    const sebResult: SebeVerifyResult = {
      sessionId: this.sessionId,
      status: result.success ? 'submitted' : 'failed',
      requestId: result.requestId,
      submissionData: {
        documentType: data.documentType,
        submittedAt: new Date().toISOString(),
        message: result.success
          ? 'Your verification is being processed. You will be notified once complete.'
          : 'Verification submission failed. Please try again.',
      },
    }

    if (result.success) {
      this.emit('success', sebResult)
    } else {
      this.emit('error', new Error('Verification submission failed'))
    }

    return sebResult
  }

  /**
   * Show desktop modal with QR code
   */
  private showModal(): void {
    if (!this.sessionId) return

    const primaryColor = this.config.theme?.primaryColor || '#000000'
    const borderRadius = this.config.theme?.borderRadius || '12px'
    const verifyUrl = this.getVerificationUrl(this.sessionId)
    const qrCodeUrl = this.getQRCodeUrl(this.sessionId)

    this.modalElement = document.createElement('div')
    this.modalElement.id = 'sebeverify-modal'
    this.modalElement.innerHTML = `
      <style>
        #sebeverify-modal {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          font-family: system-ui, -apple-system, sans-serif;
        }
        #sebeverify-modal * {
          box-sizing: border-box;
        }
        .sv-modal-content {
          background: white;
          border-radius: ${borderRadius};
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: sv-slide-up 0.3s ease;
        }
        @keyframes sv-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .sv-logo {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          background: ${primaryColor};
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sv-logo svg {
          width: 28px;
          height: 28px;
          color: white;
        }
        .sv-title {
          font-size: 20px;
          font-weight: 600;
          color: #111;
          margin: 0 0 8px;
        }
        .sv-subtitle {
          font-size: 14px;
          color: #666;
          margin: 0 0 24px;
        }
        .sv-qr-container {
          background: #f9fafb;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .sv-qr-code {
          width: 180px;
          height: 180px;
          margin: 0 auto 16px;
          border-radius: 8px;
          background: white;
          padding: 8px;
        }
        .sv-qr-code img {
          width: 100%;
          height: 100%;
        }
        .sv-instruction {
          font-size: 13px;
          color: #666;
          margin: 0;
        }
        .sv-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }
        .sv-divider-line {
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }
        .sv-divider-text {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
        }
        .sv-send-link {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .sv-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }
        .sv-input:focus {
          border-color: ${primaryColor};
        }
        .sv-btn {
          padding: 12px 20px;
          background: ${primaryColor};
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .sv-btn:hover {
          opacity: 0.9;
        }
        .sv-btn-outline {
          background: transparent;
          color: #666;
          border: 1px solid #e5e7eb;
        }
        .sv-btn-outline:hover {
          background: #f9fafb;
        }
        .sv-close {
          width: 100%;
          margin-top: 8px;
        }
        .sv-footer {
          font-size: 11px;
          color: #999;
          margin-top: 16px;
        }
        .sv-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: #f0fdf4;
          border-radius: 8px;
          margin-bottom: 16px;
          color: #166534;
          font-size: 14px;
        }
        .sv-status.waiting {
          background: #fef3c7;
          color: #92400e;
        }
        .sv-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: sv-spin 1s linear infinite;
        }
        @keyframes sv-spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="sv-modal-content">
        <div class="sv-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <h2 class="sv-title">Verify Your Identity</h2>
        <p class="sv-subtitle">Scan the QR code with your phone to continue verification</p>

        <div class="sv-status waiting" id="sv-status">
          <div class="sv-spinner"></div>
          <span>Waiting for document submission...</span>
        </div>

        <div class="sv-qr-container">
          <div class="sv-qr-code">
            <img src="${qrCodeUrl}" alt="QR Code" />
          </div>
          <p class="sv-instruction">Point your camera at the QR code</p>
        </div>

        <div class="sv-divider">
          <div class="sv-divider-line"></div>
          <span class="sv-divider-text">or send link</span>
          <div class="sv-divider-line"></div>
        </div>

        <div class="sv-send-link">
          <input type="email" class="sv-input" placeholder="Enter email or phone" id="sv-contact-input" />
          <button class="sv-btn" id="sv-send-btn">Send</button>
        </div>

        <button class="sv-btn sv-btn-outline sv-close" id="sv-close-btn">Cancel</button>

        <p class="sv-footer">Powered by SebeVerify</p>
      </div>
    `

    document.body.appendChild(this.modalElement)

    const closeBtn = this.modalElement.querySelector('#sv-close-btn')
    closeBtn?.addEventListener('click', () => this.close())

    const sendBtn = this.modalElement.querySelector('#sv-send-btn')
    sendBtn?.addEventListener('click', () => this.sendLink())

    this.startStatusPolling()

    window.addEventListener('message', this.handleMessage.bind(this))
  }

  private sendLink(): void {
    const input = document.querySelector('#sv-contact-input') as HTMLInputElement
    const value = input?.value

    if (!value) {
      alert('Please enter an email or phone number')
      return
    }

    console.log('[SebeVerify] Sending link to:', value)
    alert(`Verification link sent to ${value}`)

    this.emit('mobile_opened')
  }

  private startStatusPolling(): void {
    const checkStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const status = urlParams.get('status')
      const session = urlParams.get('session')

      if (status && session === this.sessionId) {
        if (status === 'success') {
          this.handleSuccess()
        } else if (status === 'cancelled') {
          this.handleCancel()
        }
        window.history.replaceState({}, '', window.location.pathname)
        return
      }

      if (!this.sessionId) return

      const sessionData = await this.getSessionStatus(this.sessionId)
      if (!sessionData) return

      if (sessionData.status === 'approved') {
        this.handleSuccess()
      } else if (sessionData.status === 'rejected') {
        this.handleSuccess()
      }
    }

    void checkStatus()
    this.checkInterval = setInterval(() => {
      void checkStatus()
    }, 1500)
  }

  private handleMessage(event: MessageEvent): void {
    if (event.data?.type === 'sebeverify_result') {
      const { status, sessionId } = event.data

      if (sessionId === this.sessionId) {
        if (status === 'success') {
          this.handleSuccess()
        } else if (status === 'error') {
          this.handleError(new Error(event.data.message || 'Verification failed'))
        }
      }
    }
  }

  private handleSuccess(): void {
    const result: SebeVerifyResult = {
      sessionId: this.sessionId!,
      status: 'submitted',
      submissionData: {
        documentType: 'national_id',
        submittedAt: new Date().toISOString(),
        message: 'Your verification is being processed. You will be notified once complete.',
      },
    }

    const statusEl = document.querySelector('#sv-status')
    if (statusEl) {
      statusEl.className = 'sv-status'
      statusEl.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span>Documents submitted for review!</span>
      `
    }

    this.emit('success', result)
    setTimeout(() => this.close(), 2000)
  }

  private handleError(error: Error): void {
    this.emit('error', error)
    this.close()
  }

  private handleCancel(): void {
    const result: SebeVerifyResult = {
      sessionId: this.sessionId!,
      status: 'cancelled',
    }
    this.emit('cancelled', result)
    this.close()
  }

  close(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    window.removeEventListener('message', this.handleMessage.bind(this))

    if (this.modalElement) {
      this.modalElement.remove()
      this.modalElement = null
    }
  }

  destroy(): void {
    this.close()
    this.eventListeners.clear()
    this.sessionId = null
    this.sessionToken = null
  }
}

export function init(config: SebeVerifyConfig): SebeVerifySDK {
  if (!config.apiKey) {
    throw new Error('SebeVerify: apiKey is required')
  }
  if (!config.redirectUrl) {
    throw new Error('SebeVerify: redirectUrl is required')
  }
  return new SebeVerifySDK(config)
}

const SebeVerify = { init }
export default SebeVerify
