import { useQuery } from '@tanstack/react-query'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { getCosmosValidators } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'

/**
 * Lists the full validator set for the chain. Defaults to bonded validators
 * only — the typical case for the delegate / redelegate picker UI. Pass
 * `status: undefined` to include unbonding / unbonded entries as well.
 */
export const useCosmosValidatorsQuery = (chain: IbcEnabledCosmosChain) =>
  useQuery({
    queryKey: ['cosmosValidators', chain, 'bonded'],
    queryFn: () => getCosmosValidators(chain, { status: 'BOND_STATUS_BONDED' }),
    staleTime: 60_000,
  })
