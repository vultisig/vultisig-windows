import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ParsedTx } from './core/parsedTx'
import { ParseTxStep } from './ParseTxStep'
import { SendTxOverview } from './SendTxOverview'
import { TxGuard } from './TxGuard'

export const VerifyTx = () => {
  const { t } = useTranslation()
  const [isSendTxOverviewError, setIsSendTxOverviewError] = useState(false)

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          isSendTxOverviewError ? undefined : <PageHeaderBackButton />
        }
        title={t('sign_transaction')}
        hasBorder
      />
      <TxGuard>
        <ValueTransfer<ParsedTx>
          from={({ onFinish }) => <ParseTxStep onFinish={onFinish} />}
          to={({ value }) => (
            <SendTxOverview
              parsedTx={value}
              onSendTxOverviewErrorChange={setIsSendTxOverviewError}
            />
          )}
        />
      </TxGuard>
    </VStack>
  )
}
