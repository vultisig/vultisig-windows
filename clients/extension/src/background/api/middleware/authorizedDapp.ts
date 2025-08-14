import { CosmosChain, EvmChain } from '@core/chain/Chain'
import { getCosmosChainId } from '@core/chain/chains/cosmos/chainInfo'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'

import { callPopupApi } from '../../../popup/api/call'
import {
  addVaultAppSession,
  getVaultAppSessions,
} from '../../../sessions/state/appSessions'
import { storage } from '../../../storage'
import { getDappHost, getDappHostname } from '../../../utils/connectedApps'
import { BackgroundApiInterface } from '../interface'
import { BackgroundApiResolver } from '../resolver'

const getDefaultAppSession = (requestOrigin: string) => {
  return {
    host: getDappHostname(requestOrigin),
    url: getDappHost(requestOrigin),
    selectedCosmosChainId: getCosmosChainId(CosmosChain.THORChain),
    selectedEVMChainId: getEvmChainId(EvmChain.Ethereum),
  }
}

export const authorizedDapp =
  <K extends keyof BackgroundApiInterface>(
    resolver: BackgroundApiResolver<K>
  ): BackgroundApiResolver<K> =>
  async params => {
    const { context } = params
    const { requestOrigin } = context

    const ensureVaultId = async () => {
      const currentVaultId = await storage.getCurrentVaultId()
      if (currentVaultId) {
        return currentVaultId
      }

      const { vaultId } = await callPopupApi({
        grantVaultAccess: {},
      })

      await storage.setCurrentVaultId(vaultId)

      await addVaultAppSession({
        vaultId: vaultId,
        session: getDefaultAppSession(requestOrigin),
      })

      return vaultId
    }

    const vaultId = await ensureVaultId()
    const vaultSessions = await getVaultAppSessions(vaultId)

    const dappHostname = getDappHostname(requestOrigin)
    const currentSession = vaultSessions[dappHostname]

    if (!currentSession) {
      const { vaultId } = await callPopupApi({
        grantVaultAccess: {},
      })

      await storage.setCurrentVaultId(vaultId)

      await addVaultAppSession({
        vaultId: vaultId,
        session: getDefaultAppSession(requestOrigin),
      })
    }

    return resolver(params)
  }
