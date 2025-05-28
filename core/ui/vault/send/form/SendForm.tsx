import { Button } from '@lib/ui/buttons/Button'
import { WithProgressIndicator } from '@lib/ui/flow/WithProgressIndicator'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { PageContent } from '@lib/ui/page/PageContent'
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
import { useSendFormValidationQuery } from '../queries/useSendFormValidationQuery'
import { ManageReceiver } from '../receiver/ManageReceiver'
import { RefreshSend } from '../RefreshSend'
import { Sender } from '../sender/Sender'

const FormContent = styled(PageContent)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: calc(100vh - 64px);
`

const FormFields = styled(VStack)`
  flex: 1;
`

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
      <FormContent
        as="form"
        scrollable
        gap={40}
        {...getFormProps({
          onSubmit: onFinish,
          isDisabled,
        })}
      >
        <FormFields gap={16}>
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
        </FormFields>
        <Button
          isLoading={isLoading && isPending}
          isDisabled={isDisabled}
          type="submit"
        >
          {t('continue')}
        </Button>
      </FormContent>
    </>
  )
}
