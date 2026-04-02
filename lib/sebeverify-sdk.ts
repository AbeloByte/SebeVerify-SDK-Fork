/**
 * SebeVerify Web SDK
 * Embeddable identity verification SDK for merchants
 */

export interface SebeVerifyConfig {
  apiKey: string
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
  status: 'submitted' | 'failed' | 'cancelled'
  submissionData?: {
    documentType: string
    submittedAt: string
    message: string
  }
}

type EventType = 'started' | 'mobile_opened' | 'success' | 'error' | 'cancelled'
type EventCallback = (data?: SebeVerifyResult | Error) => void

class SebeVerifySDK {
  private config: SebeVerifyConfig
  private eventListeners: Map<EventType, EventCallback[]> = new Map()
  private sessionId: string | null = null
  private modalElement: HTMLDivElement | null = null
  private checkInterval: ReturnType<typeof setInterval> | null = null

  constructor(config: SebeVerifyConfig) {
    this.config = config
    this.eventListeners = new Map()
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
   * Create a verification session
   */
  private async createSession(): Promise<string> {
    // Mock API call - in real implementation, this would call the backend
    // POST /api/sdk/session
    const mockSessionId = `sv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return mockSessionId
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
    const baseUrl = this.config.redirectUrl || window.location.origin + '/verify'
    const returnUrl = encodeURIComponent(window.location.href)
    return `${baseUrl}?session=${sessionId}&returnUrl=${returnUrl}`
  }

  /**
   * Start the verification flow
   */
  async start(): Promise<void> {
    try {
      this.emit('started')
      
      // Create session
      this.sessionId = await this.createSession()
      
      if (this.isMobile()) {
        // On mobile, redirect directly to verification
        window.location.href = this.getVerificationUrl(this.sessionId)
      } else {
        // On desktop, show modal with QR code
        this.showModal()
      }
    } catch (error) {
      this.emit('error', error as Error)
    }
  }

  /**
   * Show desktop modal with QR code
   */
  private showModal(): void {
    if (!this.sessionId) return

    const primaryColor = this.config.theme?.primaryColor || '#2563eb'
    const borderRadius = this.config.theme?.borderRadius || '12px'
    const verifyUrl = this.getVerificationUrl(this.sessionId)
    const qrCodeUrl = this.getQRCodeUrl(this.sessionId)

    // Create modal container
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

    // Add event listeners
    const closeBtn = this.modalElement.querySelector('#sv-close-btn')
    closeBtn?.addEventListener('click', () => this.close())

    const sendBtn = this.modalElement.querySelector('#sv-send-btn')
    sendBtn?.addEventListener('click', () => this.sendLink())

    // Start polling for verification status
    this.startStatusPolling()

    // Listen for messages from the verification page
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  /**
   * Send verification link via email/SMS
   */
  private sendLink(): void {
    const input = document.querySelector('#sv-contact-input') as HTMLInputElement
    const value = input?.value

    if (!value) {
      alert('Please enter an email or phone number')
      return
    }

    // Mock sending link
    console.log('[SebeVerify] Sending link to:', value)
    alert(`Verification link sent to ${value}`)
    
    this.emit('mobile_opened')
  }

  /**
   * Poll for verification status
   */
  private startStatusPolling(): void {
    // Check URL for status changes (from redirect)
    const checkUrl = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const status = urlParams.get('status')
      const session = urlParams.get('session')

      if (status && session === this.sessionId) {
        if (status === 'success') {
          this.handleSuccess()
        } else if (status === 'cancelled') {
          this.handleCancel()
        }
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    // Check immediately
    checkUrl()

    // Poll periodically (mock - in real implementation, use WebSocket or long polling)
    this.checkInterval = setInterval(checkUrl, 1000)
  }

  /**
   * Handle message from verification iframe/window
   */
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

  /**
   * Handle successful submission
   */
  private handleSuccess(): void {
    const result: SebeVerifyResult = {
      sessionId: this.sessionId!,
      status: 'submitted',
      submissionData: {
        documentType: 'national_id',
        submittedAt: new Date().toISOString(),
        message: 'Your verification is being processed. You will be notified once complete.'
      }
    }

    // Update modal status
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
    
    // Auto-close after success
    setTimeout(() => this.close(), 2000)
  }

  /**
   * Handle verification error
   */
  private handleError(error: Error): void {
    this.emit('error', error)
    this.close()
  }

  /**
   * Handle cancellation
   */
  private handleCancel(): void {
    const result: SebeVerifyResult = {
      sessionId: this.sessionId!,
      status: 'cancelled'
    }
    this.emit('cancelled', result)
    this.close()
  }

  /**
   * Close the modal
   */
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

  /**
   * Destroy the SDK instance
   */
  destroy(): void {
    this.close()
    this.eventListeners.clear()
    this.sessionId = null
  }
}

/**
 * Initialize SebeVerify SDK
 */
export function init(config: SebeVerifyConfig): SebeVerifySDK {
  if (!config.apiKey) {
    throw new Error('SebeVerify: apiKey is required')
  }
  if (!config.redirectUrl) {
    throw new Error('SebeVerify: redirectUrl is required')
  }
  return new SebeVerifySDK(config)
}

// Default export for easy importing
const SebeVerify = { init }
export default SebeVerify
