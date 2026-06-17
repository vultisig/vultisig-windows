import { DefiPageContainer } from '@core/ui/defi/shared/DefiPageContainer'
import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useTranslation } from 'react-i18next'

import { useVultStakingViewState } from '../state/vultStakingViewState'
import { VultStakeVerify } from './verify/VultStakeVerify'
import { VultStakeForm } from './VultStakeForm'

export const VultStakeView = () => {
  const { t } = useTranslation()
  const [, setViewState] = useVultStakingViewState()

  return (
    <ValueTransfer<bigint>
      from={({ onFinish }) => (
        <>
          <TitleHeader
            title={t('vultStaking.deposit_header')}
            onBack={() => setViewState({ type: 'home' })}
          />
          <DefiPageContainer>
            <VultStakeForm onFinish={onFinish} />
          </DefiPageContainer>
        </>
      )}
      to={({ value, onBack }) => (
        <VultStakeVerify value={value} onBack={onBack} />
      )}
    />
  )
}
