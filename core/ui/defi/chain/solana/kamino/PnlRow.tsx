import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

type PnlRowProps = {
  /** Lifetime profit and loss in the vault's underlying token. */
  amount: number
  ticker: string
}

/**
 * One vault's lifetime profit and loss. A gain carries an explicit `+` because
 * a loss already carries its own sign, and an unsigned figure beside a signed
 * one reads as though only one of them had a direction.
 */
export const PnlRow = ({ amount, ticker }: PnlRowProps) => {
  const { t } = useTranslation()

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Text size={13} color="shy">
        {t('kamino_earn_pnl')}
      </Text>
      <Text size={13} color={amount < 0 ? 'danger' : 'success'}>
        {`${amount < 0 ? '' : '+'}${formatAmount(amount, { ticker })}`}
      </Text>
    </HStack>
  )
}
