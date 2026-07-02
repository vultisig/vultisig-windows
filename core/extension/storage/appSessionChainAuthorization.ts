import { AppSession } from '@core/extension/storage/appSessions'
import { Chain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { getCosmosChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { getEvmChainId } from '@vultisig/core-chain/chains/evm/chainInfo'

type GetAppSessionFieldsForApprovedChainsInput = {
  chains?: readonly Chain[]
  selectedChain?: Chain
}

export const getAppSessionFieldsForApprovedChains = ({
  chains,
  selectedChain,
}: GetAppSessionFieldsForApprovedChainsInput): Partial<AppSession> => {
  if (!chains?.length) {
    return {}
  }

  const authorizedChains = [...new Set(chains)]
  const selected = selectedChain ?? authorizedChains[0]

  if (isChainOfKind(selected, 'evm')) {
    return {
      authorizedChains,
      selectedEVMChainId: getEvmChainId(selected),
    }
  }

  if (isChainOfKind(selected, 'cosmos')) {
    return {
      authorizedChains,
      selectedCosmosChainId: getCosmosChainId(selected),
    }
  }

  return { authorizedChains }
}

export const getAppSessionFieldsForApprovedChain = (
  chain?: Chain
): Partial<AppSession> =>
  getAppSessionFieldsForApprovedChains({
    chains: chain ? [chain] : undefined,
    selectedChain: chain,
  })

export const isAppSessionAuthorizedForChain = ({
  appSession,
  chain,
}: {
  appSession: AppSession
  chain: Chain
}): boolean => {
  if (appSession.authorizedChains) {
    return appSession.authorizedChains.includes(chain)
  }

  if (appSession.isAccountAccessGranted === false) {
    return false
  }

  return true
}

export const isAppSessionAuthorizedForAccounts = (
  appSession: AppSession
): boolean =>
  appSession.isAccountAccessGranted ?? appSession.authorizedChains === undefined
