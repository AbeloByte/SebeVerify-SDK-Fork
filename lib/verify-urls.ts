import { headers } from 'next/headers'
import os from 'os'

export type VerifyPageUrls = {
  verifyPageUrl: string
  qrCodeImageUrl: string
}

/**
 * Builds the URL shown in the desktop QR code and used for deep links.
 * Replaces localhost with the machine LAN IP so phones on the same network can reach the dev server.
 */
export async function buildVerifyPageUrls(): Promise<VerifyPageUrls> {
  const headersList = await headers()
  let host = headersList.get('host') || 'localhost:3000'

  if (host.startsWith('localhost')) {
    const port = host.split(':')[1] || '3000'
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const info of interfaces[name] || []) {
        if ((info.family === 'IPv4' || String(info.family) === '4') && !info.internal) {
          host = `${info.address}:${port}`
          break
        }
      }
      if (!host.startsWith('localhost')) break
    }
  }

  const forwardedProto = headersList.get('x-forwarded-proto')
  const isLocalHttp =
    host.includes('localhost') ||
    host.includes('192.168') ||
    host.includes('10.') ||
    host.includes('172.')
  const protocol =
    forwardedProto === 'https' || forwardedProto === 'http'
      ? forwardedProto
      : isLocalHttp
        ? 'http'
        : 'https'

  const verifyPageUrl = `${protocol}://${host}/verify`
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyPageUrl)}`

  return { verifyPageUrl, qrCodeImageUrl }
}
