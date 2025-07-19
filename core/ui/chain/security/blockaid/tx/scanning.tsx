import { Spinner } from '@lib/ui/loaders/Spinner'
import { useTranslation } from 'react-i18next'

import { BlockaidTxStatusContainer } from './statusContainer'

export const BlockaidTxScanning = () => {
  const { t } = useTranslation()
  return (
    <BlockaidTxStatusContainer>
      <Spinner kind="secondary" />
      {t('scanning')}
    </BlockaidTxStatusContainer>
  )
}
