import { storage } from '@core/extension/storage'
import {
  getVaultAppSessions,
  VaultAppSession,
} from '@core/extension/storage/appSessions'
import type { BackgroundMethod } from '@core/inpage-provider/background/interface'
import type { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import type { BridgeContext } from '@lib/extension/bridge/context'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

import { BackgroundError } from '../error'

export const authorized =
  <K extends BackgroundMethod>(
    resolver: BackgroundResolver<
      K,
      BridgeContext & { appSession: VaultAppSession }
    >
  ): BackgroundResolver<K> =>
  async params => {
    const { context } = params
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

    return resolver({
      ...params,
      context: {
        ...params.context,
        appSession: { ...appSession, vaultId },
      },
    })
  }
