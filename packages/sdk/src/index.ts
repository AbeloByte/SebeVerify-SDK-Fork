/**
 * SebeVerify Web SDK
 * Embeddable identity verification SDK for merchants
 * Compatible with SebeVerify Backend (real API)
 */

export interface SebeVerifyConfig {
  apiKey: string;
  projectId: string;
  backendUrl?: string;
  /** Public URL where the SebeVerify web app is hosted (serves /verify/[sessionId]) */
  webAppUrl?: string;
  redirectUrl: string;
  theme?: {
    primaryColor?: string;
    borderRadius?: string;
  };
}

export interface SebeVerifyResult {
  sessionId: string;
  status: "submitted" | "failed" | "cancelled" | "pending";
  submissionData?: {
    documentType: string;
    submittedAt: string;
    message: string;
  };
  requestId?: string;
}

type EventType =
  | "started"
  | "mobile_opened"
  | "success"
  | "error"
  | "cancelled"
  | "pending";
type EventCallback = (data?: SebeVerifyResult | Error) => void;

interface BackendSessionResponse {
  session_id: string;
  project_id: string;
  document_type: string;
  document_id: string;
  expires_at: string;
  max_attempts: number;
  remaining_attempts: number;
  recovered: boolean;
}

interface BackendUploadResponse {
  request_id: string;
  project_id: string;
  document_type: string;
  document_id: string;
  status: string;
  token_balance: number;
}

class SebeVerifySDK {
  private config: SebeVerifyConfig;
  private eventListeners: Map<EventType, EventCallback[]> = new Map();
  private sessionId: string | null = null;
  private requestId: string | null = null;
  private documentType: string = "national-id";
  private documentId: string = "";
  private modalElement: HTMLDivElement | null = null;
  private backendUrl: string;
  private frontendUrl: string = "";
  private webAppUrl: string = "";

  constructor(config: SebeVerifyConfig) {
    if (!config.apiKey) {
      throw new Error("apiKey is required");
    }
    if (!config.projectId) {
      throw new Error("projectId is required");
    }
    this.config = config;
    this.eventListeners = new Map();
    this.backendUrl = config.backendUrl || "http://localhost:8000";
    if (typeof window !== "undefined") {
      this.frontendUrl = window.location.origin;
      this.webAppUrl = config.webAppUrl || this.frontendUrl;
    }
  }

  on(event: EventType, callback: EventCallback): this {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
    return this;
  }

  off(event: EventType, callback: EventCallback): this {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  private emit(event: EventType, data?: SebeVerifyResult | Error): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Error in ${event} handler:`, e);
      }
    });
  }

  private getApiHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.config.apiKey,
    };
  }

  private async createSession(): Promise<string> {
    this.documentId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const url = `${this.backendUrl}/projects/${this.config.projectId}/verification/session/start`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.getApiHeaders(),
      body: JSON.stringify({
        document_type: this.documentType,
        document_id: this.documentId,
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Failed to create session" }));
      throw new Error(
        error.detail || `Failed to create session (${response.status})`,
      );
    }

    const data = (await response.json()) as BackendSessionResponse;
    this.sessionId = data.session_id;
    return data.session_id;
  }

  private async uploadDocument(
    sessionId: string,
    documentType: string,
    documentId: string,
    frontImage: Blob,
    backImage: Blob | null,
    selfieImage: Blob,
  ): Promise<string> {
    const url = `${this.backendUrl}/projects/${this.config.projectId}/verification/image`;

    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("document_type", documentType);
    formData.append("document_id", documentId);
    formData.append("document_image", frontImage, "document_front.jpg");
    formData.append("person_image", selfieImage, "selfie.jpg");

    if (backImage) {
      formData.append("document_image_back", backImage, "document_back.jpg");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-Key": this.config.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Failed to upload document" }));
      throw new Error(
        error.detail || `Failed to upload document (${response.status})`,
      );
    }

    const data = (await response.json()) as BackendUploadResponse;
    this.requestId = data.request_id;
    return data.request_id;
  }

  private createModal(verificationUrl: string): void {
    if (this.modalElement) return;

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.9); z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const container = document.createElement("div");
    container.style.cssText = `
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 20px; padding: 40px;
      max-width: 420px; text-align: center; color: white;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    `;

    container.innerHTML = `
      <div style="font-size: 56px; margin-bottom: 20px;">🔒</div>
      <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 600;">Verification Ready</h2>
      <p style="color: #9ca3af; margin: 0 0 32px; line-height: 1.5;">
        Click below to complete your identity verification
      </p>
      <a href="${verificationUrl}" style="
        display: block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        padding: 16px 32px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 20px;
      ">Start Verification</a>
      <button id="sdk-cancel-btn" style="
        background: transparent;
        border: 1px solid #4b5563;
        color: #9ca3af;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
      ">Cancel</button>
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #374151;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          You'll be redirected to complete verification
        </p>
      </div>
    `;

    const cancelBtn = container.querySelector("#sdk-cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.closeModal();
        this.emit("cancelled");
      });
    }

    overlay.appendChild(container);
    document.body.appendChild(overlay);
    this.modalElement = overlay;
  }

  private closeModal(): void {
    if (this.modalElement) {
      this.modalElement.remove();
      this.modalElement = null;
    }
  }

  private isMobile(): boolean {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  async start(): Promise<void> {
    try {
      this.emit("started");

      const sessionId = await this.createSession();

      const verificationUrl = `${this.webAppUrl}/verify/${sessionId}?returnUrl=${encodeURIComponent(this.config.redirectUrl)}&backendUrl=${encodeURIComponent(this.backendUrl)}&projectId=${encodeURIComponent(this.config.projectId)}&apiKey=${encodeURIComponent(this.config.apiKey)}`;

      if (this.isMobile()) {
        window.location.href = verificationUrl;
        this.emit("mobile_opened");
        return;
      }

      this.createModal(verificationUrl);
    } catch (error) {
      this.closeModal();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.emit("error", new Error(errorMessage));
      throw error;
    }
  }

  async submitDocument(options: {
    frontImage: Blob;
    backImage?: Blob;
    selfieImage: Blob;
    documentType?: string;
  }): Promise<void> {
    if (!this.sessionId) {
      throw new Error("No active session. Call start() first.");
    }

    try {
      const docType = options.documentType || this.documentType;

      await this.uploadDocument(
        this.sessionId,
        docType,
        this.documentId,
        options.frontImage,
        options.backImage || null,
        options.selfieImage,
      );

      this.emit("success", {
        sessionId: this.sessionId,
        status: "submitted",
        requestId: this.requestId || undefined,
        submissionData: {
          documentType: docType,
          submittedAt: new Date().toISOString(),
          message: "Document uploaded successfully",
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      this.emit("error", new Error(errorMessage));
      throw error;
    }
  }

  destroy(): void {
    this.closeModal();
    this.eventListeners.clear();
    this.sessionId = null;
    this.requestId = null;
  }
}

export default function init(config: SebeVerifyConfig): SebeVerifySDK {
  return new SebeVerifySDK(config);
}

export { SebeVerifySDK };

/**
 * Server-side verification functions for use in Next.js API routes.
 * These functions handle verification logic on the server.
 */

export interface VerificationRequest {
  sessionId: string;
  documentType?: string;
  documentId?: string;
  frontImage?: string;
  backImage?: string;
  selfieImage?: string;
}

export interface VerificationResponse {
  success: boolean;
  sessionId: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  requestId?: string;
  verifiedAt?: string;
}

export interface CreateVerificationSessionOptions {
  apiKey: string;
  projectId: string;
  backendUrl?: string;
  documentType?: string;
  documentId?: string;
}

export interface CreateVerificationSessionResult {
  sessionId: string;
  backendUrl: string;
  projectId: string;
}

const verificationSessions = new Map<string, VerificationResponse>();

/**
 * Creates a real verification session on SebeVerify backend.
 */
export async function createVerificationSession(
  config: CreateVerificationSessionOptions,
): Promise<CreateVerificationSessionResult> {
  const backendUrl = config.backendUrl || "http://localhost:8000";
  const documentType = config.documentType || "national-id";
  const documentId =
    config.documentId ||
    `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const url = `${backendUrl}/projects/${config.projectId}/verification/session/start`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": config.apiKey,
    },
    body: JSON.stringify({
      document_type: documentType,
      document_id: documentId,
    }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Failed to create verification session" }));
    const errorDetail =
      typeof error?.detail === "string"
        ? error.detail
        : JSON.stringify(error?.detail ?? error);
    throw new Error(
      `${errorDetail || "Failed to create verification session"} (${response.status})`,
    );
  }

  const data = (await response.json()) as { session_id: string };

  return {
    sessionId: data.session_id,
    backendUrl,
    projectId: config.projectId,
  };
}

/**
 * Legacy in-memory helper kept for backwards compatibility.
 */
export function initiateVerification(config: {
  apiKey: string;
  projectId: string;
  backendUrl?: string;
}): {
  sessionId: string;
  verificationUrl: string;
} {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const baseUrl = config.backendUrl || "http://localhost:3000";

  const response: VerificationResponse = {
    success: true,
    sessionId,
    status: "pending",
  };

  verificationSessions.set(sessionId, response);

  return {
    sessionId,
    verificationUrl: `${baseUrl}/verify/${sessionId}`,
  };
}

export function verifyUser(request: VerificationRequest): VerificationResponse {
  const session = verificationSessions.get(request.sessionId);

  if (!session) {
    return {
      success: false,
      sessionId: request.sessionId,
      status: "rejected",
      message: "Session not found",
    };
  }

  const updated: VerificationResponse = {
    success: true,
    sessionId: request.sessionId,
    status: "approved",
    message: "Verification completed successfully",
    requestId: `req_${Date.now()}`,
    verifiedAt: new Date().toISOString(),
  };

  verificationSessions.set(request.sessionId, updated);

  return updated;
}

export function getVerificationStatus(
  sessionId: string,
): VerificationResponse | null {
  return verificationSessions.get(sessionId) || null;
}
