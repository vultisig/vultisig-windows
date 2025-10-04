import { Chain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { callPopup } from '@core/inpage-provider/popup'
import { PopupError } from '@core/inpage-provider/popup/error'
import { attempt } from '@lib/utils/attempt'

import { EIP1193Error } from '../../../background/handlers/errorHandler'

export const requestAccount = async (chain: Chain) => {
  const { error, data } = await attempt(
    callBackground({
      getAccount: { chain },
    })
  )

  if (data) {
    return data
  }

  if (error === BackgroundError.Unauthorized) {
    const { data, error } = await attempt(
      callPopup({
        grantVaultAccess: {},
      })
    )

    if (data) {
      return callBackground({
        getAccount: { chain },
      })
    }

    if (error === PopupError.RejectedByUser) {
      throw new EIP1193Error('UserRejectedRequest')
    }
  }

  throw new EIP1193Error('InternalError')
}
