import { VaultAppSession } from '@core/extension/storage/appSessions'
import type { BackgroundMethod } from '@core/inpage-provider/background/interface'
import type { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import type { BridgeContext } from '@lib/extension/bridge/context'

import { authorizeContext } from '../core/authorization'

export const authorized =
  <K extends BackgroundMethod>(
    resolver: BackgroundResolver<
      K,
      BridgeContext & { appSession: VaultAppSession }
    >
  ): BackgroundResolver<K> =>
  async params =>
    resolver({
      ...params,
      context: await authorizeContext(params.context),
    })
