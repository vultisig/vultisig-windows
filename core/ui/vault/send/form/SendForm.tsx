import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnFinishProp } from '@lib/ui/props'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ManageAddresses } from '../addresses/ManageAddresses'
import { ManageAmount } from '../amount/ManageAmount'
import { ManageSendCoin } from '../coin/ManageSendCoin'
import {
  initialSendFormFieldState,
  SendFormFieldStateProvider,
} from '../providers/SendFormFieldStateProvider'
import { useSendFormValidationQuery } from '../queries/useSendFormValidationQuery'
import { RefreshSend } from '../RefreshSend'

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
        secondaryControls={<RefreshSend />}
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
      />
      <PageWrapper>
        <PageContent
          as="form"
          gap={40}
          {...getFormProps({
            onSubmit: onFinish,
            isDisabled,
          })}
        >
          <VStack gap={16}>
            <SendFormFieldStateProvider
              initialValue={initialSendFormFieldState}
            >
              <ManageSendCoin />
              <ManageAddresses />
              <ManageAmount />
            </SendFormFieldStateProvider>
          </VStack>
          <Button
            isLoading={isLoading && isPending}
            isDisabled={isDisabled}
            type="submit"
          >
            {t('continue')}
          </Button>
        </PageContent>
      </PageWrapper>
    </>
  )
}

const PageWrapper = styled(VStack)`
  width: 800px;
  max-width: min(100%, 800px);
  margin-inline: auto;
  flex: 1;
`
