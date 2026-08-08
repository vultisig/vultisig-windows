import { callBackground } from '@core/inpage-provider/background'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { callPopup } from '@core/inpage-provider/popup'
import { PopupError } from '@core/inpage-provider/popup/error'
import { Chain } from '@vultisig/core-chain/Chain'
import { attempt } from '@vultisig/lib-utils/attempt'

import { EIP1193Error } from '../../../background/handlers/errorHandler'

// All injected providers (EVM, Solana, Cosmos, UTXO) live in the same inpage
// realm, so a multi-chain dApp fires several `requestAccount` calls roughly in
// parallel and each would otherwise open its own `grantVaultAccess` popup — a
// popup storm where only one grant wins the race and the rest come back as
// `InternalError`. Coalesce concurrent grant requests from this page into a
// single popup: the first caller opens it, the rest await the same result,
// then each re-fetches its own account against the granted session.
const openGrantVaultAccessPopup = (input: {
  preselectFastVault?: boolean
  chain: Chain
  chains?: readonly Chain[]
}) =>
  callPopup({
    grantVaultAccess: {
      preselectFastVault: input.preselectFastVault,
      chain: input.chain,
      ...(input.chains ? { chains: input.chains } : {}),
    },
  })

let pendingGrantVaultAccess: ReturnType<
  typeof openGrantVaultAccessPopup
> | null = null

const grantVaultAccessOnce = (
  input: Parameters<typeof openGrantVaultAccessPopup>[0]
): ReturnType<typeof openGrantVaultAccessPopup> => {
  if (pendingGrantVaultAccess) {
    return pendingGrantVaultAccess
  }

  const started = openGrantVaultAccessPopup(input)
  pendingGrantVaultAccess = started

  const clear = () => {
    if (pendingGrantVaultAccess === started) {
      pendingGrantVaultAccess = null
    }
  }
  started.then(clear, clear)

  return started
}

const isBridgeTransportError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  const unwrappedMessage = message.replace(
    /^Failed to send message to background script after \d+ attempts:\s*/i,
    ''
  )

  return /Receiving end does not exist|Could not establish connection|message port closed|Extension context invalidated/i.test(
    unwrappedMessage
  )
}

export const requestAccount = async (
  chain: Chain,
  options?: { preselectFastVault?: boolean; chains?: readonly Chain[] }
) => {
  const { error, data } = await attempt(
    callBackground({
      getAccount: { chain },
    })
  )

  if (data?.address) {
    return data
  }

  // The grant-access popup is the only recovery path. Always exit with a
  // specific EIP-1193 code — never let a catch-all InternalError mask the
  // common no-vault / popup-dismissed paths (#3973).
  const grantAccessAndGetAccount = async () => {
    const result = await attempt(
      grantVaultAccessOnce({
        preselectFastVault: options?.preselectFastVault,
        chain,
        chains: options?.chains,
      })
    )
    if (result.data?.appSession) {
      // Validate the post-grant fetch: if it rejects or returns an empty
      // address (e.g. user picked a vault without a key for this chain),
      // surface 4100 instead of leaking a raw error or returning `['']`.
      const accountResult = await attempt(
        callBackground({
          getAccount: { chain, appSession: result.data.appSession },
        })
      )
      if (accountResult.data?.address) {
        return accountResult.data
      }
      throw new EIP1193Error('Unauthorized')
    }
    // Window closed via X aborts to RejectedByUser. A resolved-but-empty
    // response means the popup was dismissed mid-flow — treat as a user
    // rejection so dApps can retry intelligently.
    if (result.error === PopupError.RejectedByUser || !result.error) {
      throw new EIP1193Error('UserRejectedRequest')
    }
    throw new EIP1193Error('InternalError')
  }

  // Origin not authorized for the current vault, or vault is authorized but
  // has no account for this chain (e.g. Solana on an EVM-only import) →
  // prompt the user to pick a vault that supports this chain.
  if (
    error === BackgroundError.Unauthorized ||
    data !== undefined ||
    isBridgeTransportError(error)
  ) {
    return grantAccessAndGetAccount()
  }

  // Any other `getAccount` failure (no vault loaded, storage failure, etc.)
  // is an unauthorized state from the dApp's perspective. EIP-1193 §5.2
  // reserves 4100 for "requested method/account requires authorization".
  throw new EIP1193Error('Unauthorized')
}
