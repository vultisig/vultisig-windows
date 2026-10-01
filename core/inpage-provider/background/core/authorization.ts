import { storage } from '@core/extension/storage'
import {
  getVaultAppSessions,
  getVaultsAppSessions,
  VaultAppSession,
} from '@core/extension/storage/appSessions'
import { findVault } from '@core/extension/storage/vaults'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { sleep } from '@vultisig/lib-utils/sleep'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'

import { AuthorizedCallContext, CallInitialContext } from '../../call/context'
import { getVaultChainAddress } from './getVaultChainAddress'

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
 * cannot authorize itself for a vault its origin was never granted. With an
 * account hint, a connected vault that derives that address wins; otherwise
 * (or when none does) the current vault's session is used.
 */
export const authorizeContext = async (
  context: CallInitialContext,
  { retryOnMissing = false }: AuthorizeContextOptions = {}
): Promise<AuthorizedCallContext> => {
  const { requestOrigin, account } = context
  const host = getUrlBaseDomain(requestOrigin)

  // When the caller names an address, prefer the vault connected to this
  // origin that derives it. Ownership is checked against vault key material,
  // the same derivation `getAccount` reports, so it holds for chains the user
  // never added to their portfolio.
  const resolveAccountSession = async (): Promise<VaultAppSession | null> => {
    if (!account) return null

    const sessions = await getVaultsAppSessions()

    for (const [vaultId, vaultSessions] of Object.entries(sessions)) {
      const appSession = vaultSessions[host]
      if (!appSession) continue

      // Deleting a vault leaves its sessions behind, so a session can point
      // at a vault that is gone.
      const vault = await findVault(vaultId)
      if (!vault) continue

      const address = await getVaultChainAddress({
        vault,
        chain: account.chain,
      })

      if (address && areLowerCaseEqual(address, account.address)) {
        return { ...appSession, vaultId }
      }
    }

    return null
  }

  const resolveCurrentVaultSession =
    async (): Promise<VaultAppSession | null> => {
      const vaultId = shouldBePresent(
        await storage.getCurrentVaultId(),
        'currentVaultId'
      )
      const appSession = (await getVaultAppSessions(vaultId))[host]

      return appSession ? { ...appSession, vaultId } : null
    }

  const attempts = retryOnMissing ? sessionLookupRetries : 1

  for (let attempt = 0; attempt < attempts; attempt++) {
    const appSession =
      (await resolveAccountSession()) ?? (await resolveCurrentVaultSession())

    if (appSession) {
      return { ...context, appSession }
    }

    if (attempt < attempts - 1) {
      await sleep(sessionLookupRetryDelayMs)
    }
  }

  throw BackgroundError.Unauthorized
}
