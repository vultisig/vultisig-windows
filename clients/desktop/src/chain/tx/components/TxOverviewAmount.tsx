import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker'
import { useTranslation } from 'react-i18next'

import { ValueProp } from '../../../lib/ui/props'
import { TxOverviewRow } from './TxOverviewRow'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'

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
