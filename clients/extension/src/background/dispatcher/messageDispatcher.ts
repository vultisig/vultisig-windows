import {
  handleGetVault,
  handleGetVaults,
} from '@clients/extension/src/background/handlers/accountsHandler'
import { handleRequest } from '@clients/extension/src/background/handlers/requestHandler'
import { generateCosmosAccount } from '@clients/extension/src/background/utils/cosmosAccount'
import { Messenger } from '@clients/extension/src/messengers/createMessenger'
import { getVaultsAppSessions } from '@clients/extension/src/sessions/state/appSessions'
import { getDappHostname } from '@clients/extension/src/utils/connectedApps'
import {
  MessageKey,
  RequestMethod,
} from '@clients/extension/src/utils/constants'
import { Chain } from '@core/chain/Chain'
import {
  getCosmosChainByChainId,
  getCosmosChainId,
} from '@core/chain/chains/cosmos/chainInfo'
import {
  getEvmChainByChainId,
  getEvmChainId,
} from '@core/chain/chains/evm/chainInfo'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'

export const dispatchMessage = async (
  type: MessageKey,
  message: any,
  sender: chrome.runtime.MessageSender,
  popupMessenger: Messenger
) => {
  const safeOrigin = typeof sender.origin === 'string' ? sender.origin : ''
  const sessions = (await getVaultsAppSessions()) ?? {}
  const dappHostname = safeOrigin ? getDappHostname(safeOrigin) : ''
  if (!dappHostname) {
    console.warn('dispatcher: Cannot resolve dapp hostname - aborting request')
    return
  }
  const chainSelectors = {
    [MessageKey.COSMOS_REQUEST]: () => {
      const chainId = getCosmosChainId(Chain.Cosmos)

      const selectedCosmosChainId = Object.values(sessions).reduce(
        (acc, vault) => vault[dappHostname]?.selectedCosmosChainId ?? acc,
        chainId
      )

      return getCosmosChainByChainId(selectedCosmosChainId)
    },
    [MessageKey.ETHEREUM_REQUEST]: () => {
      const chainId = getEvmChainId(Chain.Ethereum)

      const selectedEVMChainId = Object.values(sessions).reduce(
        (acc, vault) => vault[dappHostname]?.selectedEVMChainId ?? acc,
        chainId
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
    [MessageKey.SOLANA_REQUEST, Chain.Solana],
    [MessageKey.THOR_REQUEST, Chain.THORChain],
  ] as const

  for (const [key, chain] of basicRequests) {
    if (type === key) return handleRequest(message, chain, safeOrigin)
  }
  if (type in chainSelectors) {
    const selector = chainSelectors[type as keyof typeof chainSelectors]
    const chain = selector?.()
    if (!chain) return
    const response = await handleRequest(
      message,
      shouldBePresent(chain),
      safeOrigin
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

  try {
    return match(type, {
      [MessageKey.VAULT]: () => handleGetVault(safeOrigin),
      [MessageKey.VAULTS]: () => handleGetVaults(popupMessenger),
    } as Record<MessageKey, () => unknown>) // Forcefully unify return types to unknown because return types are different
  } catch {
    console.warn(`Unhandled message type: ${type}`)
    return
  }
}
