import { getAppSession } from '@core/inpage-provider/background/core/appSession'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

/**
 * Reports whether the requesting origin holds an active `appSession` against
 * the current vault. Backs `Keplr.isEnabled` (and any future analogue) so
 * cosmos-kit / graz adapters can probe connection state without rounding
 * through `getKey`.
 *
 * Host-keyed: chain selection is ignored here because Vultisig's sessions
 * grant per-host, not per-chain.
 */
export const hasAppSession: BackgroundResolver<'hasAppSession'> = async ({
  context: { requestOrigin },
}) => {
  const appSession = await getAppSession(requestOrigin)
  return !!appSession
}
