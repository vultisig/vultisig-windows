import { getVaultAppSessions } from '../../../sessions/state/appSessions'
import { storage } from '../../../storage'
import { getDappHostname } from '../../../utils/connectedApps'
import { BackgroundApiInterface } from '../interface'
import { BackgroundApiResolver, BackgroundApiResolverParams } from '../resolver'

export const authorizedDapp =
  <K extends keyof BackgroundApiInterface>(
    resolver: BackgroundApiResolver<K>
  ): BackgroundApiResolver<K> =>
  async (params: BackgroundApiResolverParams<K>) => {
    const { context } = params
    const { requestOrigin } = context

    const currentVaultId = await storage.getCurrentVaultId()

    if (!currentVaultId) {
      throw new Error('TODO: handle connection request')
    }

    const vaultSessions = await getVaultAppSessions(currentVaultId)

    const dappHostname = getDappHostname(requestOrigin)
    const currentSession = vaultSessions[dappHostname]

    if (!currentSession) {
      throw new Error('TODO: handle connection request')
    }

    return resolver(params)
  }
