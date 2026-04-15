import {
  getBlockaidPayloadSimulationInput,
  getBlockaidSimulationQueryWithParsing,
} from '@core/ui/chain/security/blockaid/tx/queries/blockaidPayloadSimulation'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { Query } from '@lib/ui/query/Query'
import { WalletCore } from '@trustwallet/wallet-core'
import {
  BlockaidEvmSimulationInfo,
  BlockaidSolanaSimulationInfo,
} from '@vultisig/core-chain/security/blockaid/tx/simulation/core'
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
  const blockaidTxSimulationInput = useTransformQueryData(
    keysignPayloadQuery,
    useCallback(
      payload => getBlockaidPayloadSimulationInput({ payload, walletCore }),
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
