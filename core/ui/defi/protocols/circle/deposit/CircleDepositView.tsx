import { TitleHeader } from '@core/ui/flow/TitleHeader'
import { useTranslation } from 'react-i18next'

import { CirclePageContainer } from '../CirclePageContainer'
import { useCircleViewState } from '../state/circleViewState'
import { CircleDepositForm } from './CircleDepositForm'

export const CircleDepositView = () => {
  const { t } = useTranslation()
  const [, setViewState] = useCircleViewState()

  return (
    <>
      <TitleHeader
        title={t('circle.deposit_header')}
        onBack={() => setViewState('home')}
      />
      <CirclePageContainer>
        <CircleDepositForm />
      </CirclePageContainer>
    </>
  )
}
