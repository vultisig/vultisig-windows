import { CircleMinusIcon } from '@lib/ui/icons/CircleMinusIcon'
import { useTranslation } from 'react-i18next'

import { DeFiActionButton } from '../../../components/DeFiActionButton'
import { useCircleViewState } from '../state/circleViewState'

export const CircleWithdrawButton = () => {
  const { t } = useTranslation()
  const [, setViewState] = useCircleViewState()

  return (
    <DeFiActionButton
      kind="secondary"
      onClick={() => setViewState('withdraw')}
      icon={<CircleMinusIcon />}
    >
      {t('circle.withdraw')}
    </DeFiActionButton>
  )
}
