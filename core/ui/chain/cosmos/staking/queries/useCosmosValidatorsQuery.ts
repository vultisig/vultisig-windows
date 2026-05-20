import { useQuery } from '@tanstack/react-query'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { getCosmosValidators } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'

/**
 * Lists the full validator set for the chain. Defaults to bonded validators
 * only — the typical case for the delegate / redelegate picker UI. Pass
 * `status: undefined` to include unbonding / unbonded entries as well.
 */
export const useCosmosValidatorsQuery = (
  chain: IbcEnabledCosmosChain | undefined
) =>
  useQuery({
    queryKey: ['cosmosValidators', chain ?? '', 'bonded'] as const,
    queryFn: () =>
      // The guard below disables the query when `chain` is undefined, so
      // by the time `queryFn` runs `chain` is guaranteed non-null.
      getCosmosValidators(chain as IbcEnabledCosmosChain, {
        status: 'BOND_STATUS_BONDED',
      }),
    enabled: chain !== undefined,
    staleTime: 60_000,
  })
