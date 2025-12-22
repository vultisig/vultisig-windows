import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useTranslation } from 'react-i18next'

import { CirclePageContainer } from '../CirclePageContainer'
import { useCircleViewState } from '../state/circleViewState'
import { CircleDepositForm } from './CircleDepositForm'
import { CircleDepositVerify } from './verify/CircleDepositVerify'

export const CircleDepositView = () => {
  const { t } = useTranslation()
  const [, setCircleViewState] = useCircleViewState()

  return (
    <ValueTransfer<bigint>
      from={({ onFinish }) => (
        <>
          <TitleHeader
            title={t('circle.deposit_header')}
            onBack={() => setCircleViewState('home')}
          />
          <CirclePageContainer>
            <CircleDepositForm onFinish={onFinish} />
          </CirclePageContainer>
        </>
      )}
      to={({ value, onBack }) => (
        <CircleDepositVerify value={value} onBack={onBack} />
      )}
    />
  )
}
