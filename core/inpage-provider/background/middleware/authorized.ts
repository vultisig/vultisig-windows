import { storage } from '@core/extension/storage'
import {
  addVaultAppSession,
  type AppSession,
  getVaultAppSessions,
} from '@core/extension/storage/appSessions'
import type { BackgroundMethod } from '@core/inpage-provider/background/interface'
import type { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { callPopup } from '@core/inpage-provider/popup'
import type { BridgeContext } from '@lib/extension/bridge/context'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { getUrlHost } from '@lib/utils/url/host'

const getDefaultAppSession = (requestOrigin: string) => {
  return {
    host: getUrlBaseDomain(requestOrigin),
    url: getUrlHost(requestOrigin),
  }
}

export const authorized =
  <K extends BackgroundMethod>(
    resolver: BackgroundResolver<K, BridgeContext & { appSession: AppSession }>
  ): BackgroundResolver<K> =>
  async params => {
    const { context } = params
    const { requestOrigin } = context

    const vaultId = shouldBePresent(
      await storage.getCurrentVaultId(),
      'currentVaultId'
    )
    const vaultSessions = await getVaultAppSessions(vaultId)

    const Hostname = getUrlBaseDomain(requestOrigin)
    const currentSession = vaultSessions[Hostname]

    const appSession = currentSession ?? getDefaultAppSession(requestOrigin)

    if (!currentSession) {
      const { vaultId } = await callPopup({
        grantVaultAccess: {},
      })

      await storage.setCurrentVaultId(vaultId)

      await addVaultAppSession({
        vaultId,
        session: appSession,
      })
    }

    return resolver({
      ...params,
      context: {
        ...params.context,
        appSession,
      },
    })
  }
