import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { ReviewRow } from '../../../mpc/keysign/review/ReviewRow'
import { KeysignFeeAmount } from '../../../mpc/keysign/tx/FeeAmount'
import { useDepositKeysignPayloadQuery } from '../keysignPayload/query'

/** The estimated network fee of the deposit's payload, stacked over its fiat value. */
export const DepositFeeRow = () => {
  const { t } = useTranslation()
  const keysignPayloadQuery = useDepositKeysignPayloadQuery()

  return (
    <ReviewRow
      label={t('est_network_fee')}
      value={
        <MatchQuery
          value={keysignPayloadQuery}
          pending={() => <Spinner />}
          success={payload => (
            <KeysignFeeAmount keysignPayload={payload} layout="stacked" />
          )}
          error={() => (
            <Text as="span" size={14} color="shy">
              —
            </Text>
          )}
        />
      }
    />
  )
}
