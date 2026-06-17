import { DefiPageContainer } from '@core/ui/defi/shared/DefiPageContainer'
import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useTranslation } from 'react-i18next'

import { useVultStakingViewState } from '../state/vultStakingViewState'
import { VultUnstakeVerify } from './verify/VultUnstakeVerify'
import { VultUnstakeForm } from './VultUnstakeForm'

/** Unstake flow: amount entry (slider), then the keysign verify step. */
export const VultUnstakeView = () => {
  const { t } = useTranslation()
  const [, setViewState] = useVultStakingViewState()

  return (
    <ValueTransfer<bigint>
      from={({ onFinish }) => (
        <>
          <TitleHeader
            title={t('vultStaking.withdraw_header')}
            onBack={() => setViewState({ type: 'home' })}
          />
          <DefiPageContainer>
            <VultUnstakeForm onFinish={onFinish} />
          </DefiPageContainer>
        </>
      )}
      to={({ value, onBack }) => (
        <VultUnstakeVerify value={value} onBack={onBack} />
      )}
    />
  )
}
