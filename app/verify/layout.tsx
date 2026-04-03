import type { Metadata } from "next"
import { headers } from "next/headers"
import { VerifyRouteGate } from "@/components/verification/verify-route-gate"
import { buildVerifyPageUrls } from "@/lib/verify-urls"

export const metadata: Metadata = {
  title: "Identity Verification - SebeVerify",
  description: "Complete your identity verification securely",
}

const MOBILE_UA =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|CriOS|FxiOS|EdgiOS/i

export default async function VerifyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const ua = headersList.get("user-agent") || ""
  const initialMobileFlow = MOBILE_UA.test(ua)
  const { verifyPageUrl, qrCodeImageUrl } = await buildVerifyPageUrls()

  return (
    <VerifyRouteGate
      initialMobileFlow={initialMobileFlow}
      verifyPageUrl={verifyPageUrl}
      qrCodeImageUrl={qrCodeImageUrl}
    >
      {children}
    </VerifyRouteGate>
  )
}
