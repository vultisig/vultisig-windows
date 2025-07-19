import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ValueProp } from '@lib/ui/props'
import { useMemo } from 'react'

import { BlockaidNoTxScanStatus } from '../tx/noScanStatus'
import { BlockaidTxScan } from '../tx/scan'
import { keysignPayloadToBlockaidTxScanInput } from './core/toBlockaidTxScanInput'

export const BlockaidKeysignPayloadScan = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const txScanInput = useMemo(
    () => keysignPayloadToBlockaidTxScanInput(value),
    [value]
  )

  if (txScanInput === null) {
    return <BlockaidNoTxScanStatus />
  }

  return <BlockaidTxScan value={txScanInput} />
}
