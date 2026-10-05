import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'

import { toExactAmountString } from '../../deposit/utils/exactAmountString'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'

type SendAmountReducedWarningProps = {
  keysignPayloadQuery: Query<KeysignPayload>
}

/**
 * Warns when the amount being signed is lower than the one set on the form.
 * Building the payload re-reads the balance and the network fee and clamps a
 * full-balance send to what still covers that fee, so a fee that rose after the
 * amount was chosen would otherwise shrink the send without a word (#5109).
 */
export const SendAmountReducedWarning = ({
  keysignPayloadQuery,
}: SendAmountReducedWarningProps) => {
  const { t } = useTranslation()
  const [amount] = useSendAmount()
  const coin = useCurrentSendCoin()
  const requestedAmount = shouldBePresent(amount)

  // Every digit, not a rounded figure: the two amounts differ by the change in
  // the fee, which can sit far below display precision.
  const formatExact = (value: bigint) =>
    `${toExactAmountString(value, coin.decimals)} ${coin.ticker}`

  return (
    <MatchQuery
      value={keysignPayloadQuery}
      success={({ toAmount }) => {
        const signedAmount = BigInt(toAmount)

        return signedAmount < requestedAmount ? (
          <WarningBlock>
            {t('send_amount_reduced_at_review', {
              amount: formatExact(signedAmount),
              requestedAmount: formatExact(requestedAmount),
            })}
          </WarningBlock>
        ) : null
      }}
    />
  )
}
