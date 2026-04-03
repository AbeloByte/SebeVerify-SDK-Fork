/**
 * SebeVerify Web SDK
 * Embeddable identity verification SDK for merchants
 */
export interface SebeVerifyConfig {
    apiKey: string;
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
    status: 'submitted' | 'failed' | 'cancelled';
    submissionData?: {
        documentType: string;
        submittedAt: string;
        message: string;
    };
}
type EventType = 'started' | 'mobile_opened' | 'success' | 'error' | 'cancelled';
type EventCallback = (data?: SebeVerifyResult | Error) => void;
declare class SebeVerifySDK {
    private config;
    private eventListeners;
    private sessionId;
    private modalElement;
    private checkInterval;
    constructor(config: SebeVerifyConfig);
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
     * Create a verification session
     */
    private createSession;
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
     * Show desktop modal with QR code
     */
    private showModal;
    /**
     * Send verification link via email/SMS
     */
    private sendLink;
    /**
     * Poll for verification status
     */
    private startStatusPolling;
    /**
     * Handle message from verification iframe/window
     */
    private handleMessage;
    /**
     * Handle successful submission
     */
    private handleSuccess;
    /**
     * Handle verification error
     */
    private handleError;
    /**
     * Handle cancellation
     */
    private handleCancel;
    /**
     * Close the modal
     */
    close(): void;
    /**
     * Destroy the SDK instance
     */
    destroy(): void;
}
/**
 * Initialize SebeVerify SDK
 */
export declare function init(config: SebeVerifyConfig): SebeVerifySDK;
declare const SebeVerify: {
    init: typeof init;
};
export default SebeVerify;
