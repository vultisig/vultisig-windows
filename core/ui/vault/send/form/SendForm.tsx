import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnFinishProp } from '@lib/ui/props'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AmountInGlobalCurrencyDisplay } from '../amount/AmountInGlobalCurrencyDisplay'
import { ManageAmount } from '../amount/ManageSendAmount'
import { ManageSendCoin } from '../coin/ManageSendCoin'
import { SendFiatFee } from '../fee/SendFiatFeeWrapper'
import { SendGasFeeWrapper } from '../fee/SendGasFeeWrapper'
import { ManageFeeSettings } from '../fee/settings/ManageFeeSettings'
import { ManageMemo } from '../memo/ManageMemo'
import {
  FocusedSendFieldProvider,
  initialFocusedSendFieldValue,
} from '../providers/FocusedSendFieldProvider'
import { useSendFormValidationQuery } from '../queries/useSendFormValidationQuery'
import { ManageReceiver } from '../receiver/ManageReceiver'
import { RefreshSend } from '../RefreshSend'
import { Sender } from '../sender/Sender'

export const SendForm = ({ onFinish }: OnFinishProp) => {
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
      <PageWrapper justifyContent="center">
        <PageContent
          as="form"
          scrollable
          gap={40}
          {...getFormProps({
            onSubmit: onFinish,
            isDisabled,
          })}
        >
          <FocusedSendFieldProvider initialValue={initialFocusedSendFieldValue}>
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
          </FocusedSendFieldProvider>
        </PageContent>
        <PageFooter>
          <Button
            isLoading={isLoading && isPending}
            isDisabled={isDisabled}
            type="submit"
          >
            {t('continue')}
          </Button>
        </PageFooter>
      </PageWrapper>
    </>
  )
}

const PageWrapper = styled(VStack)`
  width: 1200px;
  max-width: min(100%, 800px);
  margin-inline: auto;
  flex: 1;
`
