import { storage } from '@core/extension/storage'
import { getVaultAppSessions } from '@core/extension/storage/appSessions'
import { coinsStorage } from '@core/extension/storage/coins'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getRecordKeys } from '@lib/utils/record/getRecordKeys'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

import { AuthorizedCallContext, CallInitialContext } from '../../call/context'

export const authorizeContext = async (
  context: CallInitialContext
): Promise<AuthorizedCallContext> => {
  const { requestOrigin, account } = context

  const getVaultId = async () => {
    if (account) {
      const coinsRecord = await coinsStorage.getCoins()

      const vaultId = getRecordKeys(coinsRecord).find(vaultId =>
        coinsRecord[vaultId]?.some(c => areLowerCaseEqual(c.address, account))
      )

      if (vaultId) {
        return vaultId
      }

      throw BackgroundError.Unauthorized
    }

    return shouldBePresent(await storage.getCurrentVaultId(), 'currentVaultId')
  }

  const vaultId = await getVaultId()

  const vaultSessions = await getVaultAppSessions(vaultId)
  const appSession = vaultSessions[getUrlBaseDomain(requestOrigin)]

  if (!appSession) {
    throw BackgroundError.Unauthorized
  }

  return {
    ...context,
    appSession: { ...appSession, vaultId },
  }
}
