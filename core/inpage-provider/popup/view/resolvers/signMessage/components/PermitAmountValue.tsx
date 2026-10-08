import { RowValue } from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { formatPermitAmount } from '@core/inpage-provider/popup/view/resolvers/signMessage/utils/formatPermitAmount'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type PermitAmountValueProps = {
  amount: bigint
  primaryType: string
  decimals: number
  ticker?: string
}

/**
 * Value cell of a permit's "Approval amount" row. The amount wraps rather
 * than truncating so every digit the user signs stays visible; max-value
 * sentinels show as an unlimited approval with a warning.
 */
export const PermitAmountValue: FC<PermitAmountValueProps> = ({
  amount,
  primaryType,
  decimals,
  ticker,
}) => {
  const { t } = useTranslation()
  const formatted = formatPermitAmount({ amount, primaryType, decimals })
  const withTicker = (value: string) => (ticker ? `${value} ${ticker}` : value)

  if (formatted === null) {
    return (
      <HStack alignItems="center" gap={6} wrap="nowrap">
        <Text as={TriangleAlertIcon} color="warning" size={14} />
        <Text as="span" color="warning" size={14} weight={500} nowrap>
          {withTicker(t('unlimited'))}
        </Text>
      </HStack>
    )
  }

  return (
    <RowValue as="span" size={14} weight={500}>
      {withTicker(formatted)}
    </RowValue>
  )
}
