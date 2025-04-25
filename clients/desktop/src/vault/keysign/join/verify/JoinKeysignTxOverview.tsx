import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { KeysignCustomMessageInfo } from '@core/ui/mpc/keysign/custom/KeysignCustomMessageInfo'
import { JoinKeysignTxPrimaryInfo } from '@core/ui/mpc/keysign/join/tx/JoinKeysignTxPrimaryInfo'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { useMemo } from 'react'

import { KeysignSwapTxInfo } from '../../../swap/keysign/KeysignSwapTxInfo'

export const JoinKeysignTxOverview = () => {
  const { keysignMsg } = useCorePathState<'joinKeysign'>()

  const keysignPayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )

  return (
    <MatchRecordUnion
      value={keysignPayload}
      handlers={{
        keysign: payload =>
          payload.swapPayload.value ? (
            <KeysignSwapTxInfo value={payload} />
          ) : (
            <JoinKeysignTxPrimaryInfo value={payload} />
          ),
        custom: value => <KeysignCustomMessageInfo value={value} />,
      }}
    />
  )
}
