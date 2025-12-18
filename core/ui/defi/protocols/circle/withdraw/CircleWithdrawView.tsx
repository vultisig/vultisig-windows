import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useTranslation } from 'react-i18next'

import { CirclePageContainer } from '../CirclePageContainer'
import { useCircleViewState } from '../state/circleViewState'
import { CircleWithdrawForm } from './CircleWithdrawForm'
import { CircleWithdrawVerify } from './verify/CircleWithdrawVerify'

export const CircleWithdrawView = () => {
  const { t } = useTranslation()
  const [, setCircleViewState] = useCircleViewState()

  return (
    <ValueTransfer<bigint>
      from={({ onFinish }) => (
        <>
          <TitleHeader
            title={t('circle.withdraw_header')}
            onBack={() => setCircleViewState('home')}
          />
          <CirclePageContainer>
            <CircleWithdrawForm onFinish={onFinish} />
          </CirclePageContainer>
        </>
      )}
      to={({ value, onBack }) => (
        <CircleWithdrawVerify value={value} onBack={onBack} />
      )}
    />
  )
}
