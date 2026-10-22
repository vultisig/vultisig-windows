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

type IsAppSessionAuthorizedForChainInput = {
  appSession: AppSession
  chain: Chain
}

/**
 * Whether the session may use or switch to the given chain. A connected
 * session is authorized for every chain; a chain-only session (granted by a
 * chain switch without account access) only for the chains the user approved.
 */
export const isAppSessionAuthorizedForChain = ({
  appSession,
  chain,
}: IsAppSessionAuthorizedForChainInput): boolean =>
  // Once an origin is connected, authorize every chain and chain switch
  // without a fresh `grantVaultAccess` popup, so a multi-chain dApp shows a
  // single connect approval instead of one popup per chain. Origins with no
  // stored session never get here (`authorizeContext` throws `Unauthorized`
  // first). A chain-only session (`isAccountAccessGranted: false`) is limited
  // to its approved `authorizedChains`, so the #4214 fix — no silent chain
  // switch from an unconnected page — still holds for it. Account exposure
  // stays gated separately by `isAppSessionAuthorizedForAccounts`.
  //
  // Tradeoff (temporary): a connected origin can now switch the active chain
  // without an approval, partially re-opening #4214 for connected origins.
  // Accepted until the CAIP-25 multichain approval flow lands.
  appSession.isAccountAccessGranted !== false ||
  (appSession.authorizedChains?.includes(chain) ?? false)

export const isAppSessionAuthorizedForAccounts = (
  appSession: AppSession
): boolean =>
  appSession.isAccountAccessGranted ?? appSession.authorizedChains === undefined
