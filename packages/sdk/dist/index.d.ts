/**
 * SebeVerify Web SDK
 * Embeddable identity verification SDK for merchants
 */
export interface SebeVerifyConfig {
    apiKey: string;
    backendUrl?: string;
    userId?: string;
    email?: string;
    phone?: string;
    redirectUrl: string;
    theme?: {
        primaryColor?: string;
        borderRadius?: string;
    };
}
export interface SebeVerifyResult {
    sessionId: string;
    status: 'submitted' | 'failed' | 'cancelled' | 'pending';
    submissionData?: {
        documentType: string;
        submittedAt: string;
        message: string;
    };
    requestId?: string;
}
type EventType = 'started' | 'mobile_opened' | 'success' | 'error' | 'cancelled' | 'pending';
type EventCallback = (data?: SebeVerifyResult | Error) => void;
declare class SebeVerifySDK {
    private config;
    private eventListeners;
    private sessionId;
    private modalElement;
    private checkInterval;
    private backendUrl;
    private sessionToken;
    constructor(config: SebeVerifyConfig);
    private getDefaultBackendUrl;
    /**
     * Register event listener
     */
    on(event: EventType, callback: EventCallback): this;
    /**
     * Remove event listener
     */
    off(event: EventType, callback: EventCallback): this;
    private emit;
    /**
     * Resolve origin for verification app
     */
    private getVerificationAppOrigin;
    /**
     * Create a verification session via backend API
     */
    private createSession;
    /**
     * Get session status from backend
     */
    private getSessionStatus;
    /**
       * Upload verification images to backend
       */
    private uploadVerificationImages;
    /**
     * Complete a verification session
     */
    private completeSession;
    /**
     * Convert base64 data URL to Blob
     */
    private base64ToBlob;
    /**
     * Detect if user is on mobile device
     */
    private isMobile;
    /**
     * Generate QR code URL for mobile verification
     */
    private getQRCodeUrl;
    /**
     * Get verification URL
     */
    private getVerificationUrl;
    /**
     * Start the verification flow
     */
    start(): Promise<void>;
    /**
     * Submit verification data (used by the embedded verification flow)
     */
    submitVerification(data: {
        documentType: 'passport' | 'national_id' | 'driver_license';
        documentId: string;
        frontImage: string;
        backImage?: string;
        selfieImage: string;
        livenessImages?: string[];
    }): Promise<SebeVerifyResult>;
    /**
     * Show desktop modal with QR code
     */
    private showModal;
    private sendLink;
    private startStatusPolling;
    private handleMessage;
    private handleSuccess;
    private handleError;
    private handleCancel;
    close(): void;
    destroy(): void;
}
export declare function init(config: SebeVerifyConfig): SebeVerifySDK;
declare const SebeVerify: {
    init: typeof init;
};
export default SebeVerify;
