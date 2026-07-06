import { storage } from '@core/extension/storage'
import { getVaultAppSessions } from '@core/extension/storage/appSessions'
import { coinsStorage } from '@core/extension/storage/coins'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'
import { sleep } from '@vultisig/lib-utils/sleep'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'

import { AuthorizedCallContext, CallInitialContext } from '../../call/context'

type AuthorizeContextOptions = {
  /**
   * Retry the storage session lookup a few times before failing. Used right
   * after `grantVaultAccess` writes a session, where the immediate re-read can
   * miss the just-written value due to cross-context storage propagation lag
   * (#3973). Only closes that race — an origin with no granted session still
   * ends up Unauthorized.
   */
  retryOnMissing?: boolean
}

const sessionLookupRetries = 4
const sessionLookupRetryDelayMs = 50

/**
 * Resolve the authorized call context by binding the trusted `requestOrigin`
 * to a session stored for the resolved vault. The session is always read from
 * storage keyed by origin — never taken from caller input — so a forged call
 * cannot authorize itself for a vault its origin was never granted.
 */
export const authorizeContext = async (
  context: CallInitialContext,
  { retryOnMissing = false }: AuthorizeContextOptions = {}
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

  const resolveAppSession = async () => {
    const vaultId = await getVaultId()
    const vaultSessions = await getVaultAppSessions(vaultId)
    const appSession = vaultSessions[getUrlBaseDomain(requestOrigin)]

    return appSession ? { ...appSession, vaultId } : null
  }

  const attempts = retryOnMissing ? sessionLookupRetries : 1

  for (let attempt = 0; attempt < attempts; attempt++) {
    const appSession = await resolveAppSession()

    if (appSession) {
      return { ...context, appSession }
    }

    if (attempt < attempts - 1) {
      await sleep(sessionLookupRetryDelayMs)
    }
  }

  throw BackgroundError.Unauthorized
}
