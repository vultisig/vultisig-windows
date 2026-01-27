import { isChainOfKind } from '@core/chain/ChainKind'
import { BlockaidSimulationSupportedChain } from '@core/chain/security/blockaid/simulationChains'
import {
  BlockaidEVMSimulation,
  BlockaidSolanaSimulation,
  parseBlockaidEvmSimulation,
  parseBlockaidSolanaSimulation,
} from '@core/chain/security/blockaid/tx/simulation/api/core'
import {
  BlockaidEvmSimulationInfo,
  BlockaidSolanaSimulationInfo,
} from '@core/chain/security/blockaid/tx/simulation/core'
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
import base58 from 'bs58'
import { useCallback } from 'react'

type UseBlockaidSimulationQueryInput = {
  keysignPayloadQuery: Query<KeysignPayload>
  walletCore: WalletCore
}

const getBlockaidSimulationQueryWithParsing = (
  input: BlockaidTxSimulationInput<BlockaidSimulationSupportedChain>
): UseQueryOptions<
  BlockaidEvmSimulationInfo | BlockaidSolanaSimulationInfo | null
> => {
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

      if (isChainOfKind(input.chain, 'solana')) {
        return await parseBlockaidSolanaSimulation(
          sim as BlockaidSolanaSimulation
        )
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
        if (
          payload.signData &&
          payload.signData.case === 'signSolana' &&
          payload.signData.value.rawTransactions
        ) {
          const rawTransactionsBase58 =
            payload.signData.value.rawTransactions.map(base64Tx =>
              base58.encode(Buffer.from(base64Tx, 'base64'))
            )
          return getBlockaidTxSimulationInput({
            payload,
            walletCore,
            raw: rawTransactionsBase58,
          })
        }

        if (!isChainOfKind(chain, 'evm')) {
          return null
        }

        const input = getBlockaidTxSimulationInput({
          payload,
          walletCore,
        })

        if (input) {
          return input
        }

        return null
      },
      [walletCore]
    )
  )

  return usePotentialQuery(
    blockaidTxSimulationInput.data || undefined,
    getBlockaidSimulationQueryWithParsing
  ) as Query<
    BlockaidEvmSimulationInfo | BlockaidSolanaSimulationInfo | null,
    unknown
  >
}
