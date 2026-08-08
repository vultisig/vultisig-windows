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

export const isAppSessionAuthorizedForChain = ({
  appSession,
}: {
  appSession: AppSession
  chain: Chain
}): boolean =>
  // Reaching this check means `authorizeContext` already bound a stored
  // session to the request origin — i.e. the origin is already connected to
  // this vault. Once connected, authorize every chain and chain switch
  // without a fresh `grantVaultAccess` popup, so a multi-chain dApp shows a
  // single connect approval instead of one popup per chain. Unconnected
  // origins never get here (`authorizeContext` throws `Unauthorized` first),
  // so the #4214 fix — no silent chain switch from an unconnected page — is
  // preserved for them. Account exposure stays gated separately by
  // `isAppSessionAuthorizedForAccounts`.
  //
  // Tradeoff (temporary): a connected origin can now switch the active chain
  // without an approval, partially re-opening #4214 for connected origins.
  // Accepted until the CAIP-25 multichain approval flow lands.
  appSession.isAccountAccessGranted !== false

export const isAppSessionAuthorizedForAccounts = (
  appSession: AppSession
): boolean =>
  appSession.isAccountAccessGranted ?? appSession.authorizedChains === undefined
