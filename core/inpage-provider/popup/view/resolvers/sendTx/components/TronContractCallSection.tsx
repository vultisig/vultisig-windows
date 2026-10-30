import { TxOverviewEvmMemo } from '@core/ui/chain/tx/TxOverviewEvmMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { getTronContractCall } from '@core/ui/chain/tx/utils/getTronContractCall'
import { ValueProp } from '@lib/ui/props'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

/**
 * The decoded call a Tron dApp contract payload signs, so an `approve` reads
 * as one rather than as a 0 TRX send to the contract. Renders nothing for any
 * other payload.
 */
export const TronContractCallSection = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const call = getTronContractCall(value)
  if (!call) {
    return null
  }

  return (
    <TxOverviewPanel>
      <TxOverviewEvmMemo value={call.data} />
    </TxOverviewPanel>
  )
}
