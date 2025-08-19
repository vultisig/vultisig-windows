import { storage } from '@core/extension/storage'
import {
  AppSession,
  getVaultAppSessions,
} from '@core/extension/storage/appSessions'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

export const getAppSession = async (
  requestOrigin: string
): Promise<AppSession | undefined> => {
  const vaultId = await storage.getCurrentVaultId()

  if (!vaultId) {
    return
  }

  const vaultSessions = await getVaultAppSessions(vaultId)

  const hostname = getUrlBaseDomain(requestOrigin)

  return vaultSessions[hostname]
}
