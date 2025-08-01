import { getVaultAppSessions } from '@clients/extension/src/sessions/state/appSessions'
import { storage } from '@clients/extension/src/storage'

import { WalletApiInterface } from '../interface'
import { WalletApiResolver, WalletApiResolverParams } from '../resolver'

export const authorized = <K extends keyof WalletApiInterface>(
  resolver: WalletApiResolver<K>
) => {
  return async (params: WalletApiResolverParams<K>) => {
    const { context, ...resolverParams } = params
    const { dappHostname } = context

    const currentVaultId = await storage.getCurrentVaultId()

    if (!currentVaultId) {
      throw new Error('No vault selected')
    }

    const vaultSessions = await getVaultAppSessions(currentVaultId)
    const currentSession = vaultSessions[dappHostname]

    if (!currentSession) {
      throw new Error(`Dapp ${dappHostname} is not authorized`)
    }

    return resolver(resolverParams as WalletApiResolverParams<K>)
  }
}
