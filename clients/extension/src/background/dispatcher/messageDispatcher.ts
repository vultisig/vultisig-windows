import { handleRequest } from '@clients/extension/src/background/handlers/requestHandler'
import { MessageKey } from '@clients/extension/src/utils/constants'
import { Chain } from '@core/chain/Chain'
import { getCosmosChainByChainId } from '@core/chain/chains/cosmos/chainInfo'
import { getEvmChainByChainId } from '@core/chain/chains/evm/chainInfo'
import { getVaultsAppSessions } from '@core/extension/storage/appSessions'
import { getCurrentCosmosChainId } from '@core/extension/storage/currentCosmosChainId'
import { getCurrentEVMChainId } from '@core/extension/storage/currentEvmChainId'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

export const dispatchMessage = async (
  type: MessageKey,
  message: any,
  sender: chrome.runtime.MessageSender
) => {
  const safeOrigin = typeof sender.origin === 'string' ? sender.origin : ''
  const sessions = (await getVaultsAppSessions()) ?? {}
  const dappHostname = safeOrigin ? getUrlBaseDomain(safeOrigin) : ''
  if (!dappHostname) {
    console.warn('dispatcher: Cannot resolve dapp hostname - aborting request')
    return
  }
  const chainSelectors = {
    [MessageKey.COSMOS_REQUEST]: async () => {
      const defaultChainId = await getCurrentCosmosChainId()

      const selectedCosmosChainId = Object.values(sessions).reduce(
        (acc, vault) => vault[dappHostname]?.selectedCosmosChainId ?? acc,
        defaultChainId
      )

      return getCosmosChainByChainId(selectedCosmosChainId)
    },
    [MessageKey.ETHEREUM_REQUEST]: async () => {
      const defaultChainId = await getCurrentEVMChainId()

      const selectedEVMChainId = Object.values(sessions).reduce(
        (acc, vault) => vault[dappHostname]?.selectedEVMChainId ?? acc,
        defaultChainId
      )
      return getEvmChainByChainId(selectedEVMChainId)
    },
  } as const

  const basicRequests = [
    [MessageKey.BITCOIN_REQUEST, Chain.Bitcoin],
    [MessageKey.BITCOIN_CASH_REQUEST, Chain.BitcoinCash],
    [MessageKey.DASH_REQUEST, Chain.Dash],
    [MessageKey.DOGECOIN_REQUEST, Chain.Dogecoin],
    [MessageKey.LITECOIN_REQUEST, Chain.Litecoin],
    [MessageKey.MAYA_REQUEST, Chain.MayaChain],
    [MessageKey.POLKADOT_REQUEST, Chain.Polkadot],
    [MessageKey.RIPPLE_REQUEST, Chain.Ripple],
    [MessageKey.SOLANA_REQUEST, Chain.Solana],
    [MessageKey.THOR_REQUEST, Chain.THORChain],
    [MessageKey.ZCASH_REQUEST, Chain.Zcash],
  ] as const

  for (const [key, chain] of basicRequests) {
    if (type === key) return handleRequest(message, chain)
  }
  if (type in chainSelectors) {
    const selector = chainSelectors[type as keyof typeof chainSelectors]
    const chain = await selector?.()
    if (!chain) return
    const response = await handleRequest(message, shouldBePresent(chain))

    return response
  }
}
