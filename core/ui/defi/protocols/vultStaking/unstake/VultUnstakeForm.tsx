import { DefiAmountForm } from '@core/ui/defi/shared/DefiAmountForm'
import { DefiInfoNote } from '@core/ui/defi/shared/DefiInfoNote'
import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { sVultCoin, vultCoin } from '../core/config'
import { useStakedVultBalanceQuery } from '../queries/useStakedVultBalanceQuery'
import { useVultCooldownQuery } from '../queries/useVultCooldownQuery'

const secondsPerDay = 86400n

/** Amount form for unstaking (ceiling = staked sVULT) with the cooldown note. */
export const VultUnstakeForm = ({ onFinish }: OnFinishProp<bigint>) => {
  const { t } = useTranslation()
  const balanceQuery = useStakedVultBalanceQuery()
  const { data: cooldown } = useVultCooldownQuery()

  const cooldownDays =
    cooldown !== undefined ? Number(cooldown / secondsPerDay) : 0

  const note =
    cooldownDays >= 1
      ? t('vultStaking.unstake_cooldown_term', { days: cooldownDays })
      : t('vultStaking.unstake_cooldown_term_generic')

  return (
    <DefiAmountForm
      balanceQuery={balanceQuery}
      ticker={vultCoin.ticker}
      decimals={sVultCoin.decimals}
      selector="slider"
      note={<DefiInfoNote>{note}</DefiInfoNote>}
      onFinish={onFinish}
    />
  )
}
