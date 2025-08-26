import { storage } from '@core/extension/storage'
import {
  getVaultAppSessions,
  VaultAppSession,
} from '@core/extension/storage/appSessions'
import { BackgroundError } from '@core/inpage-provider/background/error'
import type { BridgeContext } from '@lib/extension/bridge/context'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

export type AuthorizedContext = BridgeContext & {
  appSession: VaultAppSession
}

export const authorizeContext = async (
  context: BridgeContext
): Promise<AuthorizedContext> => {
  const { requestOrigin } = context

  const vaultId = shouldBePresent(
    await storage.getCurrentVaultId(),
    'currentVaultId'
  )
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
