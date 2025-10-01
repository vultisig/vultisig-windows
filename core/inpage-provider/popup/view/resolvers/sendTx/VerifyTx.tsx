import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

import { ParsedTx } from './core/parsedTx'
import { ParseTxStep } from './ParseTxStep'
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
        <ValueTransfer<ParsedTx>
          from={({ onFinish }) => <ParseTxStep onFinish={onFinish} />}
          to={({ value }) => <SendTxOverview parsedTx={value} />}
        />
      </TxGuard>
    </VStack>
  )
}
