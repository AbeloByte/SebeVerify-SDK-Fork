/**
 * In-memory mock session storage for local development.
 * Replace with a real database / API when the backend is ready.
 */

export type MockSessionStatus = "pending" | "approved" | "rejected"

export type MockSession = {
  sessionId: string
  status: MockSessionStatus
  documentType?: "passport" | "national_id" | "driver_license"
  /** Data URLs from camera capture (same as in-app state), not static file paths */
  frontImage?: string
  backImage?: string
  selfieImage?: string
  createdAt: string
}

const sessions = new Map<string, MockSession>()

export function getSessionMap(): Map<string, MockSession> {
  return sessions
}

/** Test / dev only */
export function clearMockSessions(): void {
  sessions.clear()
}
