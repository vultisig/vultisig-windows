import { EvmChain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { parseBlockaidEvmSimulation } from '@core/chain/security/blockaid/tx/simulation/api/core'
import { BlockaidEvmSimulationInfo } from '@core/chain/security/blockaid/tx/simulation/core'
import { getBlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/input'
import { BlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/resolver'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getBlockaidTxSimulationQuery } from '@core/ui/chain/security/blockaid/tx/queries/blockaidTxSimulation'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { Query } from '@lib/ui/query/Query'
import { UseQueryOptions } from '@tanstack/react-query'
import { WalletCore } from '@trustwallet/wallet-core'
import { useCallback } from 'react'

type UseBlockaidSimulationQueryInput = {
  keysignPayloadQuery: Query<KeysignPayload>
  walletCore: WalletCore
}

const getBlockaidSimulationQueryWithParsing = (
  input: BlockaidTxSimulationInput<EvmChain>
): UseQueryOptions<BlockaidEvmSimulationInfo | null> => {
  const baseQuery = getBlockaidTxSimulationQuery(input)
  const evmChain = input.chain

  return {
    ...baseQuery,
    queryFn: async () => {
      const sim = await baseQuery.queryFn()

      if (
        'assets_diffs' in sim.account_summary &&
        sim.account_summary.assets_diffs.length > 0
      ) {
        return parseBlockaidEvmSimulation(sim, evmChain)
      }

      return null
    },
  }
}

export const useBlockaidSimulationQuery = ({
  keysignPayloadQuery,
  walletCore,
}: UseBlockaidSimulationQueryInput) => {
  const blockaidTxSimulationInput = useTransformQueryData(
    keysignPayloadQuery,
    useCallback(
      payload => {
        const chain = getKeysignChain(payload)
        if (!isChainOfKind(chain, 'evm')) {
          return null
        }

        const input = getBlockaidTxSimulationInput({
          payload,
          walletCore,
        })

        if (!input || !isChainOfKind(input.chain, 'evm')) {
          return null
        }

        return input as BlockaidTxSimulationInput<EvmChain>
      },
      [walletCore]
    )
  )

  return usePotentialQuery(
    blockaidTxSimulationInput.data || undefined,
    getBlockaidSimulationQueryWithParsing
  ) as Query<BlockaidEvmSimulationInfo | null, unknown>
}
