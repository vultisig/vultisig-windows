import { isChainOfKind } from '@core/chain/ChainKind'
import { BlockaidSimulationSupportedChain } from '@core/chain/security/blockaid/simulationChains'
import {
  BlockaidEVMSimulation,
  parseBlockaidEvmSimulation,
} from '@core/chain/security/blockaid/tx/simulation/api/core'
import { BlockaidEvmSimulationInfo } from '@core/chain/security/blockaid/tx/simulation/core'
import { getBlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/input'
import { BlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/resolver'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Query } from '@lib/ui/query/Query'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { WalletCore } from '@trustwallet/wallet-core'
import { useMemo } from 'react'

import { getBlockaidTxSimulationQuery } from './blockaidTxSimulation'

type UseJoinKeysignBlockaidSimulationQueryInput = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}

const getBlockaidSimulationQueryWithParsing = (
  input: BlockaidTxSimulationInput<BlockaidSimulationSupportedChain>
): UseQueryOptions<BlockaidEvmSimulationInfo | null> => {
  const baseQuery = getBlockaidTxSimulationQuery(input)

  return {
    ...baseQuery,
    queryFn: async () => {
      const sim = await baseQuery.queryFn()

      if (isChainOfKind(input.chain, 'evm')) {
        if (
          'assets_diffs' in sim.account_summary &&
          sim.account_summary.assets_diffs.length > 0
        ) {
          return parseBlockaidEvmSimulation(
            sim as BlockaidEVMSimulation,
            input.chain
          )
        }
        return null
      }

      return null
    },
  }
}

export const useJoinKeysignBlockaidSimulationQuery = ({
  keysignPayload,
  walletCore,
}: UseJoinKeysignBlockaidSimulationQueryInput): Query<BlockaidEvmSimulationInfo | null> => {
  const blockaidTxSimulationInput = useMemo(() => {
    const chain = getKeysignChain(keysignPayload)
    if (!isChainOfKind(chain, 'evm')) {
      return null
    }
    return getBlockaidTxSimulationInput({
      payload: keysignPayload,
      walletCore,
    })
  }, [keysignPayload, walletCore])

  const queryOptions = blockaidTxSimulationInput
    ? getBlockaidSimulationQueryWithParsing(blockaidTxSimulationInput)
    : ({
        queryKey: ['blockaidTxSimulation', 'disabled'],
        queryFn: async (): Promise<BlockaidEvmSimulationInfo | null> => null,
      } satisfies UseQueryOptions<BlockaidEvmSimulationInfo | null>)

  const query = useQuery({
    ...queryOptions,
    enabled: !!blockaidTxSimulationInput,
  })

  return {
    ...query,
    data: query.data ?? undefined,
  } as Query<BlockaidEvmSimulationInfo | null>
}
