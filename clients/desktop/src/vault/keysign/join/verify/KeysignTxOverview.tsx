import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { useMemo } from 'react'

import { useAppPathState } from '../../../../navigation/hooks/useAppPathState'
import { KeysignSwapTxInfo } from '../../../swap/keysign/KeysignSwapTxInfo'
import { KeysignTxPrimaryInfo } from '../../shared/KeysignTxPrimaryInfo'
import { KeysignCustomMessageInfo } from './KeysignCustomMessageInfo'

export const KeysignTxOverview = () => {
  const { keysignMsg } = useAppPathState<'joinKeysign'>()

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
            <KeysignTxPrimaryInfo value={payload} />
          ),
        custom: value => <KeysignCustomMessageInfo value={value} />,
      }}
    />
  )
}
