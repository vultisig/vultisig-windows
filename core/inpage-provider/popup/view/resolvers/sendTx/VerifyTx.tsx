import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

import { SendTxOverview } from './SendTxOverview'
import { TxGuard } from './TxGuard'

export const VerifyTx = () => {
  const { t } = useTranslation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('sign_transaction')}
        hasBorder
      />
      <TxGuard>
        <SendTxOverview />
      </TxGuard>
    </VStack>
  )
}
