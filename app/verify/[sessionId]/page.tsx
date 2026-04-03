import { VerifyPageClient } from "../verify-page-client"

type Props = { params: Promise<{ sessionId: string }> }

export default async function VerifySessionPage({ params }: Props) {
  const { sessionId } = await params
  return <VerifyPageClient sessionIdFromPath={sessionId} />
}
