import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { Trans } from 'react-i18next'

import { BlockaidLogo } from '../logo'
import { BlockaidTxStatusContainer } from './statusContainer'

export const BlockaidNoTxScanStatus = () => {
  return (
    <BlockaidTxStatusContainer>
      <TriangleAlertIcon />
      <Trans
        i18nKey="transaction_not_scanned"
        components={{
          provider: <BlockaidLogo />,
        }}
      />
    </BlockaidTxStatusContainer>
  )
}
