import { attempt } from '@vultisig/lib-utils/attempt'

import { EIP1193Error } from '../../../background/handlers/errorHandler'
import { gemWalletHandlers } from './handlers'
import {
  buildGemWalletResponse,
  GemWalletResponseBody,
  isGemWalletRequestType,
  parseGemWalletRequest,
} from './protocol'

const userRejectedCode = new EIP1193Error('UserRejectedRequest').code

/**
 * The SDK turns a result-less response into `{ type: 'reject' }` and a
 * serialized error into a thrown `Error`. dApps branch on the former when the
 * user declines, so a rejection must not reach them as a throw.
 */
const toErrorBody = (error: unknown): GemWalletResponseBody => {
  if (error instanceof EIP1193Error && error.code === userRejectedCode) {
    return { result: undefined }
  }

  const { name, message, stack } =
    error instanceof Error ? error : new Error(String(error))

  return { error: { name, message, stack } }
}

const resolveGemWalletRequest = async (
  type: string,
  payload: unknown
): Promise<GemWalletResponseBody> => {
  if (!isGemWalletRequestType(type)) {
    // Answer rather than stay silent. Only `isInstalled` has a timeout on the
    // SDK side, so ignoring anything else leaves the dApp's promise pending
    // forever — an explicit refusal at least lets it surface a failure.
    return toErrorBody(
      new EIP1193Error(
        'UnsupportedMethod',
        `GemWallet method ${type} is not supported`
      )
    )
  }

  const result = await attempt(gemWalletHandlers[type](payload))
  if ('error' in result) return toErrorBody(result.error)

  return result.data
}

/**
 * Installs the GemWallet-compatible `postMessage` bridge, making XRPL dApps
 * built on `@gemwallet/api` able to detect this wallet and read the active
 * vault's XRP account.
 *
 * GemWallet is an injected protocol rather than an object API, so — like the
 * Keplr proxy — it installs as a window listener instead of going through
 * `createProviders`. Setting `window.gemWallet` is what the SDK's
 * `isInstalled()` probes first, and it also gates its own request path: every
 * other method rejects locally with "GemWallet needs to be installed" unless
 * the flag is set, so detection is a prerequisite for connecting, not just a
 * nicety.
 */
export const installGemWalletBridge = () => {
  window.gemWallet = true

  window.addEventListener('message', async (event: MessageEvent) => {
    // Same-window only. A message from an embedded frame arrives with that
    // frame's window as `source`, and must not be able to request the top
    // frame's account.
    if (event.source !== window) return

    const request = parseGemWalletRequest(event.data)
    if (!request) return

    const body = await resolveGemWalletRequest(request.type, request.payload)

    window.postMessage(
      buildGemWalletResponse(request.messageId, body),
      window.location.origin
    )
  })
}
