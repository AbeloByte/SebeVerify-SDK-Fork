import { NextRequest, NextResponse } from "next/server"
import { getSession, updateSession } from "@/lib/mock-api"

type RouteCtx = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteCtx) {
  const { id } = await params
  const session = getSession(id)
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(session)
}

export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const updated = updateSession(id, body as Parameters<typeof updateSession>[1])
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(updated)
}
