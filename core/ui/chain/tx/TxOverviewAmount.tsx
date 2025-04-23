import { ValueProp } from '@lib/ui/props'
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'

import { TxOverviewRow } from './TxOverviewRow'

export const TxOverviewAmount = ({
  value,
  ticker,
}: ValueProp<number> & EntityWithTicker) => {
  const { t } = useTranslation()

  return (
    <TxOverviewRow>
      <span>{t('amount')}</span>
      <span>{formatTokenAmount(value, ticker)}</span>
    </TxOverviewRow>
  )
}
