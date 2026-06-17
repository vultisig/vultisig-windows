import { DefiAmountForm } from '@core/ui/defi/shared/DefiAmountForm'
import { DefiInfoNote } from '@core/ui/defi/shared/DefiInfoNote'
import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { sVultCoin, vultCoin } from '../core/config'
import { formatCooldownDuration } from '../core/formatCooldownDuration'
import { useStakedVultBalanceQuery } from '../queries/useStakedVultBalanceQuery'
import { useVultCooldownQuery } from '../queries/useVultCooldownQuery'

export const VultUnstakeForm = ({ onFinish }: OnFinishProp<bigint>) => {
  const { t } = useTranslation()
  const balanceQuery = useStakedVultBalanceQuery()
  const { data: cooldown } = useVultCooldownQuery()

  const note =
    cooldown !== undefined
      ? t('vultStaking.unstake_cooldown_term', {
          duration: formatCooldownDuration(cooldown),
        })
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
