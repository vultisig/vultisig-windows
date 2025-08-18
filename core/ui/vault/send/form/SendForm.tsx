import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ManageAddresses } from '@core/ui/vault/send/addresses/ManageAddresses'
import { ManageAmount } from '@core/ui/vault/send/amount/ManageAmount'
import { ManageSendCoin } from '@core/ui/vault/send/coin/ManageSendCoin'
import { useSendChainSpecificQuery } from '@core/ui/vault/send/queries/useSendChainSpecificQuery'
import { useSendFormValidation } from '@core/ui/vault/send/queries/useSendFormValidation'
import { RefreshSend } from '@core/ui/vault/send/RefreshSend'
import { Button } from '@lib/ui/buttons/Button'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const SendForm = ({ onFinish }: OnFinishProp) => {
  useSendChainSpecificQuery()
  const { t } = useTranslation()
  const { isDisabled, isPending } = useSendFormValidation()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<RefreshSend />}
        title={t('send')}
        hasBorder
      />
      <FormWrapper
        as="form"
        justifyContent="space-between"
        scrollable
        gap={40}
        {...getFormProps({
          onSubmit: onFinish,
          isDisabled,
        })}
      >
        <VStack gap={16}>
          <ManageSendCoin />
          <ManageAddresses />
          <ManageAmount />
        </VStack>
        <Button disabled={isDisabled} loading={isPending} type="submit">
          {t('continue')}
        </Button>
      </FormWrapper>
    </>
  )
}

const FormWrapper = styled(PageContent)`
  width: min(468px, 100%);
  margin-inline: auto;
  overflow: auto;
  ${hideScrollbars}
`
