import { CirclePlusIcon } from '@lib/ui/icons/CirclePlusIcon'
import { useTranslation } from 'react-i18next'

import { DeFiActionButton } from '../../../components/DeFiActionButton'
import { useCircleViewState } from '../state/circleViewState'

export const CircleDepositButton = () => {
  const { t } = useTranslation()
  const [, setViewState] = useCircleViewState()

  return (
    <DeFiActionButton
      kind="primary"
      onClick={() => setViewState('deposit')}
      icon={<CirclePlusIcon />}
    >
      {t('circle.deposit')}
    </DeFiActionButton>
  )
}
