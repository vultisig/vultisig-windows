import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'

import { KeysignSwapTxInfo } from '../../../swap/keysign/KeysignSwapTxInfo'
import { KeysignTxPrimaryInfo } from '../../shared/KeysignTxPrimaryInfo'
import { KeysignCustomMessageInfo } from './KeysignCustomMessageInfo'

export const KeysignTxOverview = () => {
  const { keysignPayload } = useCorePathState<'keysign'>()

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
