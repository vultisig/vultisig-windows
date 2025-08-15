import { CosmosChain, EvmChain } from '@core/chain/Chain'
import { getCosmosChainId } from '@core/chain/chains/cosmos/chainInfo'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { storage } from '@core/extension/storage'
import { BackgroundMethod } from '@core/inpage-provider/background/interface'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { callPopup } from '@core/inpage-provider/popup'

import {
  addVaultAppSession,
  getVaultAppSessions,
} from '../../../sessions/state/appSessions'
import { getDappHost, getDappHostname } from '../../../utils/connectedApps'

const getDefaultAppSession = (requestOrigin: string) => {
  return {
    host: getDappHostname(requestOrigin),
    url: getDappHost(requestOrigin),
    selectedCosmosChainId: getCosmosChainId(CosmosChain.THORChain),
    selectedEVMChainId: getEvmChainId(EvmChain.Ethereum),
  }
}

export const authorizedDapp =
  <K extends BackgroundMethod>(
    resolver: BackgroundResolver<K>
  ): BackgroundResolver<K> =>
  async params => {
    const { context } = params
    const { requestOrigin } = context

    const ensureVaultId = async () => {
      const currentVaultId = await storage.getCurrentVaultId()
      if (currentVaultId) {
        return currentVaultId
      }

      const { vaultId } = await callPopup({
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
      const { vaultId } = await callPopup({
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
