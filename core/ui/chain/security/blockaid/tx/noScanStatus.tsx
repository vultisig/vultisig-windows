import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { useTranslation } from 'react-i18next'

import { BlockaidLogo } from '../logo'
import { BlockaidTxStatusContainer } from './statusContainer'

export const BlockaidNoTxScanStatus = () => {
  const { t } = useTranslation()
  return (
    <BlockaidTxStatusContainer>
      <TriangleAlertIcon />
      {t('transaction_not_scanned', {
        provider: <BlockaidLogo />,
      })}
    </BlockaidTxStatusContainer>
  )
}
