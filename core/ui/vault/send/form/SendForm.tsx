import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ActionForm } from '@core/ui/vault/components/action-form/ActionForm'
import { ManageAddresses } from '@core/ui/vault/send/addresses/ManageAddresses'
import { ManageAmount } from '@core/ui/vault/send/amount/ManageAmount'
import { useSpendableSendAmount } from '@core/ui/vault/send/amount/useSpendableSendAmount'
import { ManageSendCoin } from '@core/ui/vault/send/coin/ManageSendCoin'
import { useSendValidationQuery } from '@core/ui/vault/send/queries/useSendValidationQuery'
import { RefreshSend } from '@core/ui/vault/send/RefreshSend'
import { useSendAmount } from '@core/ui/vault/send/state/amount'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { isRecordEmpty } from '@vultisig/lib-utils/record/isRecordEmpty'
import { useTranslation } from 'react-i18next'

export const SendForm = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const { data, error, isPending } = useSendValidationQuery()
  const [amount, setAmount] = useSendAmount()
  const spendableAmount = useSpendableSendAmount()

  // Commit a fee-driven adjustment only here, never while the field is being
  // typed into: rewriting the amount on every keystroke would fight the user
  // for the field. Verify reads the same state, so it shows — and signs — the
  // adjusted amount rather than the one that no longer fits.
  const handleSubmit = () => {
    if (spendableAmount !== null && spendableAmount !== amount) {
      setAmount(spendableAmount)
    }

    onFinish()
  }

  const isDisabled = (() => {
    if (data && !isRecordEmpty(data)) {
      return Object.values(data)[0]
    }

    if (error) {
      return extractErrorMsg(error)
    }

    return isPending
  })()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<RefreshSend />}
        title={t('send')}
        hasBorder
      />
      <ActionForm
        as="form"
        justifyContent="space-between"
        scrollable
        gap={40}
        data-testid="send-form"
        {...getFormProps({
          onSubmit: handleSubmit,
          isDisabled,
        })}
      >
        <VStack gap={16}>
          <ManageSendCoin />
          <ManageAddresses />
          <ManageAmount />
        </VStack>
        <Button
          disabled={isDisabled}
          loading={isPending}
          type="submit"
          data-testid="send-continue"
        >
          {t('continue')}
        </Button>
      </ActionForm>
    </>
  )
}
