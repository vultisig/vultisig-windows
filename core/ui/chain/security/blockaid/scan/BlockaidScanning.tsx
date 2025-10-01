import { Spinner } from '@lib/ui/loaders/Spinner'
import { useTranslation } from 'react-i18next'

import { BlockaidScanStatusContainer } from './BlockaidScanStatusContainer'

export const BlockaidScanning = () => {
  const { t } = useTranslation()
  return (
    <BlockaidScanStatusContainer>
      <Spinner kind="secondary" />
      {t('scanning')}
    </BlockaidScanStatusContainer>
  )
}
