import { Chain, EvmChain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { parseBlockaidEvmSimulation } from '@core/chain/security/blockaid/tx/simulation/api/core'
import { getBlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/input'
import { BlockaidTxSimulationInput } from '@core/chain/security/blockaid/tx/simulation/resolver'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getBlockaidTxSimulationQuery } from '@core/ui/chain/security/blockaid/tx/queries/blockaidTxSimulation'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { WalletCore } from '@trustwallet/wallet-core'

type UseBlockaidSimulationQueryInput = {
  chain: Chain
  keysignPayload: KeysignPayload | undefined
  walletCore: WalletCore
}

export const useBlockaidSimulationQuery = ({
  chain,
  keysignPayload,
  walletCore,
}: UseBlockaidSimulationQueryInput) => {
  return useStateDependentQuery(
    {
      keysignPayload,
    },
    ({ keysignPayload }: { keysignPayload: KeysignPayload }) => {
      if (!isChainOfKind(chain, 'evm') || !keysignPayload) {
        return {
          queryKey: ['blockaidSimulation', 'skip'],
          queryFn: async () => null,
        }
      }

      const blockaidTxSimulationInput = getBlockaidTxSimulationInput({
        payload: keysignPayload,
        walletCore,
      })

      if (!blockaidTxSimulationInput) {
        return {
          queryKey: ['blockaidSimulation', 'skip'],
          queryFn: async () => null,
        }
      }

      if (!isChainOfKind(blockaidTxSimulationInput.chain, 'evm')) {
        return {
          queryKey: ['blockaidSimulation', 'skip'],
          queryFn: async () => null,
        }
      }

      const evmBlockaidTxSimulationInput: BlockaidTxSimulationInput<EvmChain> =
        {
          chain: blockaidTxSimulationInput.chain,
          data: blockaidTxSimulationInput.data,
        }

      const evmChain = evmBlockaidTxSimulationInput.chain

      const query = getBlockaidTxSimulationQuery(evmBlockaidTxSimulationInput)

      return {
        ...query,
        queryFn: async () => {
          const sim = await query.queryFn()

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
  )
}
