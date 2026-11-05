import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import {
  useCurrentVaultAddresses,
  useCurrentVaultChains,
} from '@core/ui/vault/state/currentVaultCoins'
import { useQueries } from '@tanstack/react-query'
import { Chain, OtherChain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

import { getChainApprovals } from '../core/getChainApprovals'
import {
  TokenApprovalsChain,
  tokenApprovalsEvmChains,
  tokenApprovalsUncheckedEvmChains,
} from '../core/tokenApprovalsChains'

type TokenApprovalsQueryKeyInput = {
  chain: Chain
  owner: string
}

/** Cache key of the approvals list for one vault address on one chain. */
export const getTokenApprovalsQueryKey = (input: TokenApprovalsQueryKeyInput) =>
  ['getTokenApprovals', input] as const

type ApprovalsTarget = {
  chain: TokenApprovalsChain
  owner: string
}

/**
 * Where to look: every supported EVM network for the vault's EVM address
 * (one address on all of them, so approvals on a network the vault does not
 * show are still found), and Solana when the vault has it. An imported-key
 * vault has keys only for its own chains, so it is checked on those alone.
 */
const useApprovalsTargets = () => {
  const vault = useCurrentVault()
  const addresses = useCurrentVaultAddresses()
  const vaultChains = useCurrentVaultChains()

  const evmChain = vaultChains.find(chain => isChainOfKind(chain, 'evm'))
  const isReachable = (chain: Chain) =>
    !isKeyImportVault(vault) || vaultChains.includes(chain)
  const evmTargets: ApprovalsTarget[] = evmChain
    ? tokenApprovalsEvmChains
        .filter(isReachable)
        .map(chain => ({ chain, owner: addresses[evmChain] }))
    : []
  const solanaTargets: ApprovalsTarget[] = vaultChains.includes(
    OtherChain.Solana
  )
    ? [{ chain: OtherChain.Solana, owner: addresses[OtherChain.Solana] }]
    : []

  return {
    targets: [...evmTargets, ...solanaTargets],
    uncheckedChains: evmChain
      ? tokenApprovalsUncheckedEvmChains.filter(isReachable)
      : [],
  }
}

type UseTokenApprovalsQueriesInput = {
  /** Fetch only chains with no list yet, leaving stale ones for the page to refresh. */
  missingOnly?: boolean
}

/**
 * Active approvals on every chain the page can read, one query per chain so
 * each list shows as soon as it arrives, plus the vault's chains that cannot
 * be checked.
 */
export const useTokenApprovalsQueries = ({
  missingOnly = false,
}: UseTokenApprovalsQueriesInput = {}) => {
  const { targets, uncheckedChains } = useApprovalsTargets()

  const queries = useQueries({
    queries: targets.map(target => ({
      queryKey: getTokenApprovalsQueryKey(target),
      queryFn: () => getChainApprovals(target),
      // Rate limits are retried per request; retrying the whole lookup spins for minutes.
      retry: false,
      // Keeps a revoked row from being refetched back before the tx is indexed.
      staleTime: convertDuration(1, 'min', 'ms'),
      // The popup loses memory on close; the stored list shows at once while a fresh one loads.
      meta: { shouldPersist: true },
      refetchOnMount: !missingOnly,
      refetchOnWindowFocus: !missingOnly,
    })),
  })

  return {
    chains: targets.map(({ chain }, index) => ({
      chain,
      query: queries[index],
      isFetching: queries[index].isFetching,
    })),
    uncheckedChains,
  }
}
