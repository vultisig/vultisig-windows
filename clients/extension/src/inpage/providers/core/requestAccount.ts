import { Chain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { callPopup } from '@core/inpage-provider/popup'
import { PopupError } from '@core/inpage-provider/popup/error'
import { attempt } from '@lib/utils/attempt'

import { EIP1193Error } from '../../../background/handlers/errorHandler'

export const requestAccount = async (
  chain: Chain,
  options?: { preselectFastVault?: boolean }
) => {
  const { error, data } = await attempt(
    callBackground({
      getAccount: { chain },
    })
  )

  if (data?.address) {
    return data
  }

  const openGrantVaultAccess = async () => {
    const result = await attempt(
      callPopup({
        grantVaultAccess: {
          preselectFastVault: options?.preselectFastVault,
          chain,
        },
      })
    )
    if (result.data?.appSession) {
      return callBackground({
        getAccount: { chain, appSession: result.data.appSession },
      })
    }
    if (result.error === PopupError.RejectedByUser) {
      throw new EIP1193Error('UserRejectedRequest')
    }
  }

  if (error === BackgroundError.Unauthorized) {
    const account = await openGrantVaultAccess()
    if (account) return account
  } else if (data !== undefined) {
    // Authorized but current vault has no account for this chain (e.g. Solana).
    // Re-prompt so user can select a vault that supports this chain.
    const account = await openGrantVaultAccess()
    if (account) return account
  }

  throw new EIP1193Error('InternalError')
}
