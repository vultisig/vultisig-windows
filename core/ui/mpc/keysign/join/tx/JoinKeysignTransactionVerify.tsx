import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { ValueProp } from '@lib/ui/props'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { JoinKeysignLpVerify } from './JoinKeysignLpVerify'
import { JoinKeysignSwapVerify } from './JoinKeysignSwapVerify'
import { JoinKeysignTxPrimaryInfo } from './JoinKeysignTxPrimaryInfo'
import { parseThorLpMemo } from './parseThorLpMemo'

export const JoinKeysignTransactionVerify = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const lp = value.memo ? parseThorLpMemo(value.memo) : null

  if (lp) {
    return <JoinKeysignLpVerify value={value} lp={lp} />
  }

  if (value.swapPayload?.value) {
    return <JoinKeysignSwapVerify value={value} />
  }

  return (
    <TxOverviewPanel>
      <JoinKeysignTxPrimaryInfo value={value} />
    </TxOverviewPanel>
  )
}
