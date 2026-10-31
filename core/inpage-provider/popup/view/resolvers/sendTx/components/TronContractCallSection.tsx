import { DecodedContractCallItem } from '@core/ui/chain/tx/DecodedContractCallItem'
import { TxOverviewEvmMemo } from '@core/ui/chain/tx/TxOverviewEvmMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { getTronContractCall } from '@core/ui/chain/tx/utils/getTronContractCall'
import { toTronContractCallInfo } from '@core/ui/chain/tx/utils/toTronContractCallInfo'
import { useDecodedContractCall } from '@core/ui/chain/tx/utils/useDecodedContractCall'
import { List } from '@lib/ui/list'
import { ValueProp } from '@lib/ui/props'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

/**
 * The decoded call a Tron dApp contract payload signs, so an `approve` reads
 * as one rather than as a 0 TRX send to the contract: the same `Approve` /
 * `Unlimited` row the co-signer shows, then the function and its arguments.
 * Renders nothing for any other payload.
 */
export const TronContractCallSection = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const call = getTronContractCall(value)
  const decodedCall = useDecodedContractCall({
    calldata: call?.data,
    callTarget: call?.contractAddress,
    chain: getKeysignChain(value),
    enabled: !!call,
    formatInfo: toTronContractCallInfo,
  })

  if (!call) {
    return null
  }

  return (
    <>
      {decodedCall && (
        <List>
          <DecodedContractCallItem value={decodedCall} />
        </List>
      )}
      <TxOverviewPanel>
        <TxOverviewEvmMemo
          value={call.data}
          formatInfo={toTronContractCallInfo}
        />
      </TxOverviewPanel>
    </>
  )
}
