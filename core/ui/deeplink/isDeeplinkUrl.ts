import { deepLinkBaseUrlAt } from '@vultisig/core-config'

const deeplinkPrefixes = ['http', deepLinkBaseUrlAt]

/**
 * Tells a scanned QR value that belongs to the deeplink view apart from a bare
 * wallet address. The iOS and Android apps encode send requests with the app
 * scheme, so web links alone are not enough.
 */
export const isDeeplinkUrl = (value: string) =>
  deeplinkPrefixes.some(prefix => value.startsWith(prefix))
