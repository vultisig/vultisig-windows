import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

import { KeysignFeeAmount } from '../../../mpc/keysign/tx/FeeAmount'
import { useDepositKeysignPayloadQuery } from '../keysignPayload/query'

export const DepositFee = () => {
  const keysignPayloadQuery = useDepositKeysignPayloadQuery()

  return (
    <MatchQuery
      value={keysignPayloadQuery}
      pending={() => <Spinner />}
      success={keysignPayload => (
        <KeysignFeeAmount keysignPayload={keysignPayload} />
      )}
    />
  )
}
