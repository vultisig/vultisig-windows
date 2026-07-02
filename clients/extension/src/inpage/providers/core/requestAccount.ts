import { callBackground } from '@core/inpage-provider/background'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { callPopup } from '@core/inpage-provider/popup'
import { PopupError } from '@core/inpage-provider/popup/error'
import { Chain } from '@vultisig/core-chain/Chain'
import { attempt } from '@vultisig/lib-utils/attempt'

import { EIP1193Error } from '../../../background/handlers/errorHandler'

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
      callPopup({
        grantVaultAccess: {
          preselectFastVault: options?.preselectFastVault,
          chain,
          ...(options?.chains ? { chains: options.chains } : {}),
        },
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
  if (error === BackgroundError.Unauthorized || data !== undefined) {
    return grantAccessAndGetAccount()
  }

  // Any other `getAccount` failure (no vault loaded, storage failure, etc.)
  // is an unauthorized state from the dApp's perspective. EIP-1193 §5.2
  // reserves 4100 for "requested method/account requires authorization".
  throw new EIP1193Error('Unauthorized')
}
