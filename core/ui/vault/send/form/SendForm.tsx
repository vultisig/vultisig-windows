import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnFinishProp } from '@lib/ui/props'
import { areEqualRecords } from '@lib/utils/record/areEqualRecords'
import { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ManageAddresses } from '../addresses/ManageAddresses'
import { ManageAmount } from '../amount/ManageAmount'
import { ManageSendCoin } from '../coin/ManageSendCoin'
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery'
import { useSendFormValidation } from '../queries/useSendFormValidation'
import { RefreshSend } from '../RefreshSend'
import { useSendFormFieldState } from '../state/formFields'

export const SendForm = ({ onFinish }: OnFinishProp) => {
  useSendChainSpecificQuery()
  const { t } = useTranslation()
  const [{ fieldsChecked }, setFormState] = useSendFormFieldState()
  const { errors, isLoading, isPending } = useSendFormValidation()
  const isDisabled =
    isPending ||
    Object.keys(errors).length > 0 ||
    Object.values(fieldsChecked).some(v => !v)

  useLayoutEffect(() => {
    setFormState(prev =>
      areEqualRecords(prev.errors, errors) ? prev : { ...prev, errors }
    )
  }, [errors, setFormState])

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
          disabled={!!isDisabled}
          htmlType="submit"
          kind="primary"
          label={t('continue')}
          loading={isLoading && isPending}
        />
      </PageContent>
    </>
  )
}
