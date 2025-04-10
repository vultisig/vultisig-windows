import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { OnForwardProp } from '@lib/ui/props'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getFormProps } from '../../../lib/ui/form/utils/getFormProps'
import { StrictInfoRow } from '../../../lib/ui/layout/StrictInfoRow'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator'
import { AmountInGlobalCurrencyDisplay } from '../amount/AmountInGlobalCurrencyDisplay'
import { ManageAmount } from '../amount/ManageSendAmount'
import { ManageSendCoin } from '../coin/ManageSendCoin'
import { SendFiatFee } from '../fee/SendFiatFeeWrapper'
import { SendGasFeeWrapper } from '../fee/SendGasFeeWrapper'
import { ManageFeeSettings } from '../fee/settings/ManageFeeSettings'
import { ManageMemo } from '../memo/ManageMemo'
import { useSendFormValidationQuery } from '../queries/useSendFormValidationQuery'
import { ManageReceiver } from '../receiver/ManageReceiver'
import { RefreshSend } from '../RefreshSend'
import { Sender } from '../sender/Sender'

export const SendForm = ({ onForward }: OnForwardProp) => {
  const { t } = useTranslation()

  const { error, isLoading, isPending } = useSendFormValidationQuery()

  const isDisabled = useMemo(() => {
    if (isPending) {
      return true
    }

    return error ? extractErrorMsg(error) : false
  }, [error, isPending])

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <>
            <ManageFeeSettings />
            <RefreshSend />
          </>
        }
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
      />
      <PageContent
        as="form"
        gap={40}
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
      >
        <WithProgressIndicator value={0.2}>
          <VStack gap={16}>
            <ManageSendCoin />
            <Sender />
            <ManageReceiver />
            <ManageMemo />
            <ManageAmount />
            <AmountInGlobalCurrencyDisplay />
            <VStack gap={8}>
              <StrictInfoRow>
                <SendGasFeeWrapper />
              </StrictInfoRow>
              <StrictInfoRow>
                <SendFiatFee />
              </StrictInfoRow>
            </VStack>
          </VStack>
        </WithProgressIndicator>
        <Button
          isLoading={isLoading && isPending}
          isDisabled={isDisabled}
          type="submit"
        >
          {t('continue')}
        </Button>
      </PageContent>
    </>
  )
}
