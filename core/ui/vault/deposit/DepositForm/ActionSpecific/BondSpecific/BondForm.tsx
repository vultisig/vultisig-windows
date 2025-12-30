import { TextInputWithPasteAction } from '@core/ui/components/TextInputWithPasteAction'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { useCore } from '@core/ui/state/core'
import { ActionAmountInputSurface } from '@core/ui/vault/components/action-form/ActionAmountInputSurface'
import { ActionFieldDivider } from '@core/ui/vault/components/action-form/ActionFieldDivider'
import { ActionIconButton } from '@core/ui/vault/components/action-form/ActionIconButton'
import { ActionInputContainer } from '@core/ui/vault/components/action-form/ActionInputContainer'
import { useDepositKeysignPayloadQuery } from '@core/ui/vault/deposit/keysignPayload/query'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { DepositDataProvider } from '@core/ui/vault/deposit/state/data'
import { stepFromDecimals } from '@core/ui/vault/deposit/utils/stepFromDecimals'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Modal } from '@lib/ui/modal'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { attempt } from '@lib/utils/attempt'
import { formatAmount } from '@lib/utils/formatAmount'
import { useState } from 'react'
import { Controller, FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { KeysignFeeAmount } from '../../../../../mpc/keysign/tx/FeeAmount'
import { ErrorText } from '../../DepositForm.styled'
import { FormData } from '../../types'

type BondFormProps = {
  balance: number
  errors: FieldErrors<FormData>
  isValid: boolean
}

const amountSuggestions = [0.25, 0.5, 0.75, 1]

export const BondForm = ({ balance, errors, isValid }: BondFormProps) => {
  const { t } = useTranslation()
  const [{ register, control, setValue, watch }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const { getClipboardText } = useCore()

  const [isScannerOpen, setScannerOpen] = useState(false)

  const formValues = watch()

  const nodeAddress = formValues?.nodeAddress as string | undefined
  const amountValue = formValues?.amount

  const shouldShowFeePreview =
    isValid && Boolean(nodeAddress) && Boolean(amountValue)

  const gasFeeQuery = useDepositKeysignPayloadQuery({
    enabled: shouldShowFeePreview,
  })

  const formatError = (message?: string) =>
    message
      ? t(message, { defaultValue: t('chainFunctions.default_validation') })
      : undefined

  const parsedAmount =
    typeof amountValue === 'number'
      ? amountValue
      : amountValue
        ? Number(amountValue)
        : null

  const handleSetAmount = (value: number) => {
    setValue('amount', value, { shouldValidate: true, shouldDirty: true })
  }

  const handlePaste = async () => {
    const { data } = await attempt(getClipboardText)

    if (!data) return

    setValue('nodeAddress', data, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handleScanSuccess = (value: string) => {
    setValue('nodeAddress', value, {
      shouldValidate: true,
      shouldDirty: true,
    })
    setScannerOpen(false)
  }

  const handleCopy = async () => {
    if (!nodeAddress) return

    await attempt(() => navigator.clipboard.writeText(nodeAddress))
  }

  const formattedBalance = formatAmount(balance, { ticker: coin.ticker })

  return (
    <DepositDataProvider value={formValues}>
      <VStack gap={16}>
        <ActionInputContainer>
          <InputLabel>{t('address')}</InputLabel>
          <ActionFieldDivider />
          <VStack gap={12}>
            <Text color="shy">{t('node_address')}</Text>
            <TextInputWithPasteAction
              validation={errors.nodeAddress ? 'warning' : undefined}
              placeholder={t('node_address')}
              {...register('nodeAddress')}
            />
            {errors.nodeAddress && (
              <ErrorText color="danger" size={13}>
                {formatError(errors.nodeAddress?.message as string)}
              </ErrorText>
            )}
            <HStack justifyContent="space-between" gap={8}>
              <ActionIconButton onClick={handlePaste}>
                <PasteIcon />
              </ActionIconButton>
              <ActionIconButton onClick={() => setScannerOpen(true)}>
                <CameraIcon />
              </ActionIconButton>
              <ActionIconButton disabled={!nodeAddress} onClick={handleCopy}>
                <ClipboardCopyIcon />
              </ActionIconButton>
            </HStack>
          </VStack>
        </ActionInputContainer>

        <ActionInputContainer>
          <InputLabel>{t('amount')}</InputLabel>
          <ActionFieldDivider />
          <VStack gap={12}>
            <ActionAmountInputSurface>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <AmountTextInput
                    {...field}
                    value={
                      typeof field.value === 'number'
                        ? field.value
                        : field.value === '' || field.value == null
                          ? null
                          : Number(field.value)
                    }
                    onValueChange={value => {
                      field.onChange(value ?? '')
                    }}
                    placeholder={t('enter_amount')}
                    shouldBePositive
                    step={stepFromDecimals(coin.decimals)}
                    unit={coin.ticker}
                  />
                )}
              />
            </ActionAmountInputSurface>
            {errors.amount && (
              <ErrorText color="danger" size={13}>
                {formatError(errors.amount?.message as string)}
              </ErrorText>
            )}
            <HStack justifyContent="space-between" alignItems="center" gap={4}>
              {amountSuggestions.map(suggestion => {
                const suggestedAmount = Number(
                  (balance * suggestion).toFixed(coin.decimals)
                )
                const isActive =
                  parsedAmount !== null &&
                  Number(parsedAmount?.toFixed(coin.decimals)) ===
                    suggestedAmount

                return (
                  <SuggestionOption
                    isActive={isActive}
                    key={suggestion}
                    value={suggestion}
                    onClick={() => handleSetAmount(suggestedAmount)}
                  />
                )
              })}
            </HStack>
            <HStack justifyContent="space-between" alignItems="center">
              <Text as="span" size={14} color="shy">
                {t('balance_available')}:
              </Text>
              <Text size={14}>{formattedBalance}</Text>
            </HStack>

            <VStack gap={8}>
              <InputLabel>
                {t('operator_fee')}{' '}
                <Text as="span" size={13} color="shy">
                  ({t('basis_points')})
                </Text>
              </InputLabel>
              <TextInput
                onWheel={event => event.currentTarget.blur()}
                validation={errors.operatorFee ? 'warning' : undefined}
                type="number"
                placeholder={t('operator_fee')}
                {...register('operatorFee', { valueAsNumber: true })}
              />
              {errors.operatorFee && (
                <ErrorText color="danger" size={13}>
                  {formatError(errors.operatorFee?.message as string)}
                </ErrorText>
              )}
            </VStack>

            <VStack gap={8}>
              <InputLabel>
                {t('provider')}{' '}
                <Text as="span" size={13} color="shy">
                  ({t('chainFunctions.optional_validation')})
                </Text>
              </InputLabel>
              <TextInput
                validation={errors.provider ? 'warning' : undefined}
                placeholder={t('provider')}
                {...register('provider')}
              />
              {errors.provider && (
                <ErrorText color="danger" size={13}>
                  {formatError(errors.provider?.message as string)}
                </ErrorText>
              )}
            </VStack>

            <HStack justifyContent="space-between" alignItems="center">
              <Text size={14}>{`${t('gas')} (auto)`}</Text>
              <MatchQuery
                value={gasFeeQuery}
                pending={() =>
                  shouldShowFeePreview ? (
                    <Spinner size={14} />
                  ) : (
                    <Text size={14} color="shy">
                      —
                    </Text>
                  )
                }
                success={payload => (
                  <KeysignFeeAmount keysignPayload={payload} />
                )}
                error={() => (
                  <Text size={14} color="shy">
                    —
                  </Text>
                )}
              />
            </HStack>
          </VStack>
        </ActionInputContainer>
      </VStack>

      {isScannerOpen && (
        <Modal
          title=""
          onClose={() => setScannerOpen(false)}
          withDefaultStructure={false}
        >
          <FixedScanQRView onFinish={handleScanSuccess} />
        </Modal>
      )}
    </DepositDataProvider>
  )
}

const SuggestionOption = styled(AmountSuggestion)`
  flex: 1;
  padding: 6px 18px;
  border-radius: 99px;
`

const FixedScanQRView = styled(ScanQrView)`
  position: fixed;
  inset: 0;
`
