import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/mock-api"

function verificationBaseFromRequest(request: NextRequest): string {
  const host = request.headers.get("host") || "localhost:3000"
  const forwarded = request.headers.get("x-forwarded-proto")
  const proto =
    forwarded === "https" || forwarded === "http"
      ? forwarded
      : host.includes("localhost") || host.startsWith("127.")
        ? "http"
        : "https"
  return `${proto}://${host}`
}

export async function POST(request: NextRequest) {
  const base = verificationBaseFromRequest(request)
  const body = createSession(base)
  return NextResponse.json(body)
}
