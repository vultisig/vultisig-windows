import { BlockaidEvmSimulationView } from '@core/ui/chain/security/blockaid/tx/blockaidEvmSimulationView'
import {
  getBlockaidPayloadSimulationInput,
  getBlockaidSimulationQueryWithParsing,
} from '@core/ui/chain/security/blockaid/tx/queries/blockaidPayloadSimulation'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { useTransformQueryDataAsync } from '@lib/ui/query/hooks/useTransformQueryData'
import { Query } from '@lib/ui/query/Query'
import { WalletCore } from '@trustwallet/wallet-core'
import { BlockaidSimulationSupportedChain } from '@vultisig/core-chain/security/blockaid/simulationChains'
import { BlockaidSolanaSimulationInfo } from '@vultisig/core-chain/security/blockaid/tx/simulation/core'
import { BlockaidTxSimulationInput } from '@vultisig/core-chain/security/blockaid/tx/simulation/resolver'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useCallback } from 'react'

type UseBlockaidSimulationQueryInput = {
  keysignPayloadQuery: Query<KeysignPayload>
  walletCore: WalletCore
}

export const useBlockaidSimulationQuery = ({
  keysignPayloadQuery,
  walletCore,
}: UseBlockaidSimulationQueryInput) => {
  const blockaidTxSimulationInput = useTransformQueryDataAsync(
    keysignPayloadQuery,
    useCallback(
      payload => getBlockaidPayloadSimulationInput({ payload, walletCore }),
      [walletCore]
    )
  )

  return usePotentialQuery<
    BlockaidTxSimulationInput<BlockaidSimulationSupportedChain>,
    BlockaidEvmSimulationView | BlockaidSolanaSimulationInfo | null,
    Error
  >(
    blockaidTxSimulationInput.data || undefined,
    getBlockaidSimulationQueryWithParsing
  )
}
