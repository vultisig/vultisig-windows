import { getBlockaidTxSimulationQuery } from '@core/ui/chain/security/blockaid/tx/queries/blockaidTxSimulation'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { Query } from '@lib/ui/query/Query'
import { UseQueryOptions } from '@tanstack/react-query'
import { WalletCore } from '@trustwallet/wallet-core'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { BlockaidSimulationSupportedChain } from '@vultisig/core-chain/security/blockaid/simulationChains'
import {
  BlockaidEVMSimulation,
  BlockaidSolanaSimulation,
  parseBlockaidEvmSimulation,
  parseBlockaidSolanaSimulation,
} from '@vultisig/core-chain/security/blockaid/tx/simulation/api/core'
import {
  BlockaidEvmSimulationInfo,
  BlockaidSolanaSimulationInfo,
} from '@vultisig/core-chain/security/blockaid/tx/simulation/core'
import { BlockaidTxSimulationInput } from '@vultisig/core-chain/security/blockaid/tx/simulation/resolver'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { getBlockaidTxSimulationInput } from '@vultisig/core-mpc/security/blockaid/tx/simulation/input'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import base58 from 'bs58'
import { useMemo } from 'react'

export const getBlockaidSimulationQueryWithParsing = (
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
        const solanaSim = sim as BlockaidSolanaSimulation
        if (
          'account_assets_diff' in solanaSim.account_summary &&
          solanaSim.account_summary.account_assets_diff.length > 0
        ) {
          return await parseBlockaidSolanaSimulation(solanaSim)
        }
        return null
      }

      return null
    },
  }
}

export const getBlockaidPayloadSimulationInput = ({
  payload,
  walletCore,
}: {
  payload: KeysignPayload
  walletCore: WalletCore
}) => {
  const chain = getKeysignChain(payload)
  if (
    payload.signData &&
    payload.signData.case === 'signSolana' &&
    payload.signData.value.rawTransactions &&
    payload.signData.value.rawTransactions.length > 0
  ) {
    const rawTransactionsBase58 = payload.signData.value.rawTransactions.map(
      base64Tx => base58.encode(Buffer.from(base64Tx, 'base64'))
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

  return getBlockaidTxSimulationInput({
    payload,
    walletCore,
  })
}

export const useBlockaidPayloadSimulationQuery = ({
  keysignPayload,
  walletCore,
}: {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}) => {
  const blockaidTxSimulationInput = useMemo(
    () =>
      getBlockaidPayloadSimulationInput({
        payload: keysignPayload,
        walletCore,
      }),
    [keysignPayload, walletCore]
  )

  return usePotentialQuery(
    blockaidTxSimulationInput || undefined,
    getBlockaidSimulationQueryWithParsing
  ) as Query<
    BlockaidEvmSimulationInfo | BlockaidSolanaSimulationInfo | null,
    unknown
  >
}
