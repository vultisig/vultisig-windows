import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { useMemo } from 'react'

import { getBlockaidTxScanQuery } from '../../tx/queries/blockaidTxScan'
import { keysignPayloadToBlockaidTxScanInput } from '../core/keysignPayloadToBlockaidTxScanInput'

export const useBlockaidKeysignPayloadScanQuery = (payload: KeysignPayload) => {
  const txScanInput = useMemo(
    () => keysignPayloadToBlockaidTxScanInput(payload),
    [payload]
  )

  return useStateDependentQuery({
    state: {
      txScanInput: txScanInput || undefined,
    },
    getQuery: ({ txScanInput }) => getBlockaidTxScanQuery(txScanInput),
  })
}
