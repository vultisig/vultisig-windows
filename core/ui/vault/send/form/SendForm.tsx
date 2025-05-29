import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnFinishProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ManageAddresses } from '../addresses/ManageAddresses'
import { ManageAmount } from '../amount/ManageAmount'
import { ManageSendCoin } from '../coin/ManageSendCoin'
import { useSendFormFieldState } from '../providers/SendFormFieldStateProvider'
import { useSendFormValidationQuery } from '../queries/useSendFormValidationQuery'
import { RefreshSend } from '../RefreshSend'

export const SendForm = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  const { isLoading, isPending } = useSendFormValidationQuery()
  const [{ errors }] = useSendFormFieldState()

  const isDisabled = useMemo(() => {
    if (isPending) return true
    return Object.keys(errors).length > 0
  }, [errors, isPending])

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<RefreshSend />}
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
      />
      <PageContent
        as="form"
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
        <Button
          style={{
            marginTop: 'auto',
          }}
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
