import { getVaultsAppSessions } from '@clients/extension/src/sessions/state/appSessions'
import { getDappHostname } from '@clients/extension/src/utils/connectedApps'
import {
  MessageKey,
  RequestMethod,
} from '@clients/extension/src/utils/constants'
import { Chain } from '@core/chain/Chain'
import {
  CosmosChainId,
  EVMChainId,
  getChainByChainId,
  getChainId,
} from '@core/chain/coin/ChainId'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { Messenger } from '../../messengers/createMessenger'
import { handleGetVault, handleGetVaults } from '../handlers/accountsHandler'
import { handleRequest } from '../handlers/requestHandler'
import { generateCosmosAccount } from '../utils/cosmosAccount'

export const dispatchMessage = async (
  type: MessageKey,
  message: any,
  sender: chrome.runtime.MessageSender,
  popupMessenger: Messenger
) => {
  const { origin = '' } = sender
  const sessions = await getVaultsAppSessions()
  const dappHostname = getDappHostname(origin)

  const chainSelectors = {
    [MessageKey.COSMOS_REQUEST]: () => {
      const selectedCosmosChainId = Object.values(sessions).reduce(
        (acc: CosmosChainId, vault) =>
          vault[dappHostname]?.selectedCosmosChainId ?? acc,
        getChainId(Chain.Cosmos) as CosmosChainId
      )
      return getChainByChainId(selectedCosmosChainId)
    },
    [MessageKey.ETHEREUM_REQUEST]: () => {
      const selectedEVMChainId = Object.values(sessions).reduce(
        (acc: EVMChainId, vault) =>
          vault[dappHostname]?.selectedEVMChainId ?? acc,
        getChainId(Chain.Ethereum) as EVMChainId
      )
      return getChainByChainId(selectedEVMChainId)
    },
  } as const

  const basicRequests = [
    [MessageKey.BITCOIN_REQUEST, Chain.Bitcoin],
    [MessageKey.BITCOIN_CASH_REQUEST, Chain.BitcoinCash],
    [MessageKey.DASH_REQUEST, Chain.Dash],
    [MessageKey.DOGECOIN_REQUEST, Chain.Dogecoin],
    [MessageKey.LITECOIN_REQUEST, Chain.Litecoin],
    [MessageKey.MAYA_REQUEST, Chain.MayaChain],
    [MessageKey.SOLANA_REQUEST, Chain.Solana],
    [MessageKey.THOR_REQUEST, Chain.THORChain],
  ] as const

  for (const [key, chain] of basicRequests) {
    if (type === key) return handleRequest(message, chain, origin)
  }
  if (type in chainSelectors) {
    const selector = chainSelectors[type as keyof typeof chainSelectors]
    const chain = selector?.()
    if (!chain) return
    const response = await handleRequest(
      message,
      shouldBePresent(chain),
      origin
    )

    // Handle Cosmos Account Generation
    if (
      type === MessageKey.COSMOS_REQUEST &&
      message.method === RequestMethod.VULTISIG.REQUEST_ACCOUNTS
    ) {
      const address = Array.isArray(response) ? response[0] : response

      if (typeof address === 'string') {
        return await generateCosmosAccount(address, chain)
      } else {
        console.warn(
          'Unexpected response format, cannot extract address:',
          response
        )
        return
      }
    }

    return response
  }

  switch (type) {
    case MessageKey.VAULT:
      return handleGetVault(origin)
    case MessageKey.VAULTS:
      return handleGetVaults(popupMessenger)
    default:
      console.warn(`Unhandled message type: ${type}`)
      return
  }
}
