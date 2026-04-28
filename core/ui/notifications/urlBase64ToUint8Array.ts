export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const normalizedBase64 = base64String.trim()
  const padding = '='.repeat((4 - (normalizedBase64.length % 4)) % 4)
  const base64 = (normalizedBase64 + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(rawData, c => c.charCodeAt(0))
}
