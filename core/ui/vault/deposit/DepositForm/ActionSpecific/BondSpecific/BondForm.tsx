import { TextInputWithPasteAction } from '@core/ui/components/TextInputWithPasteAction'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { useCore } from '@core/ui/state/core'
import { ActionAmountInputSurface } from '@core/ui/vault/components/action-form/ActionAmountInputSurface'
import { ActionFieldDivider } from '@core/ui/vault/components/action-form/ActionFieldDivider'
import { ActionIconButton } from '@core/ui/vault/components/action-form/ActionIconButton'
import { ActionInputContainer } from '@core/ui/vault/components/action-form/ActionInputContainer'
import { StackedField } from '@core/ui/vault/components/action-form/StackedField'
import { useDepositKeysignPayloadQuery } from '@core/ui/vault/deposit/keysignPayload/query'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { stepFromDecimals } from '@core/ui/vault/deposit/utils/stepFromDecimals'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, hStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Modal } from '@lib/ui/modal'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { attempt } from '@lib/utils/attempt'
import { formatAmount } from '@lib/utils/formatAmount'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, ControllerRenderProps, FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { KeysignFeeAmount } from '../../../../../mpc/keysign/tx/FeeAmount'
import {
  ActionFormCheckBadge,
  ActionFormIconsWrapper,
} from '../../../../components/action-form/ActionFormIconsWrapper'
import { ErrorText } from '../../DepositForm.styled'
import { FormData } from '../../types'

type BondFormProps = {
  balance: number
  errors: FieldErrors<FormData>
  formValues: FormData
}

const amountSuggestions = [0.25, 0.5, 0.75, 1]

const amountFont = "500 34px 'Brockmann', sans-serif"
const amountLetterSpacing = -1
let measureContext: CanvasRenderingContext2D | null = null

const measureAmountTextWidth = (text: string) => {
  if (!measureContext) {
    const canvas = document.createElement('canvas')
    measureContext = canvas.getContext('2d')
  }

  const ctx = measureContext
  if (!ctx) return 0

  ctx.font = amountFont
  const baseWidth = ctx.measureText(text).width
  const spacingAdjustment =
    (text?.length ?? 0) > 0
      ? amountLetterSpacing * Math.max(text.length - 1, 0)
      : 0

  return baseWidth + spacingAdjustment
}

export const BondForm = ({ balance, errors, formValues }: BondFormProps) => {
  const { t } = useTranslation()
  const [{ register, control, setValue }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const { getClipboardText } = useCore()

  const [isScannerOpen, setScannerOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<BondSection>('address')
  const [isProviderOpen, setProviderOpen] = useState(false)

  const nodeAddress = formValues?.nodeAddress as string | undefined
  const amountValue = formValues?.amount
  const providerValue = formValues?.provider as string | undefined

  const shouldShowFeePreview =
    !errors.nodeAddress &&
    !errors.amount &&
    Boolean(nodeAddress) &&
    Boolean(amountValue)

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
  const isAddressOpen = activeSection === 'address'
  const isAmountOpen = activeSection === 'amount'
  const addressHasError = Boolean(errors.nodeAddress)
  const amountHasError = Boolean(errors.amount)
  const isAddressComplete = Boolean(nodeAddress) && !addressHasError
  const isAmountComplete =
    parsedAmount !== null && parsedAmount > 0 && !amountHasError

  const lastAddressRef = useRef<string>('')

  useEffect(() => {
    const normalizedAddress = nodeAddress ?? ''
    const addressChanged = lastAddressRef.current !== normalizedAddress
    lastAddressRef.current = normalizedAddress

    if (!normalizedAddress || errors.nodeAddress) {
      setActiveSection('address')
      return
    }

    if (addressChanged) {
      setActiveSection('amount')
    }
  }, [errors.nodeAddress, nodeAddress])

  useEffect(() => {
    if (providerValue) {
      setProviderOpen(true)
    }
  }, [providerValue])

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
    <>
      <VStack gap={16}>
        <StackedField
          isOpen={activeSection === 'address'}
          renderOpen={() => (
            <ActionInputContainer>
              <InputLabel weight="600" size={16}>
                {t('address')}
              </InputLabel>
              <ActionFieldDivider />
              <VStack gap={12}>
                <Text color="shy">{t('node_address')}</Text>
                <TextInputWithPasteAction
                  validation={errors.nodeAddress ? 'warning' : undefined}
                  placeholder={t('node_address')}
                  {...register('nodeAddress')}
                  onBlur={() => {
                    if (!errors.nodeAddress && nodeAddress) {
                      setActiveSection('amount')
                    }
                  }}
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
                  <ActionIconButton
                    disabled={!nodeAddress}
                    onClick={handleCopy}
                  >
                    <ClipboardCopyIcon />
                  </ActionIconButton>
                </HStack>
              </VStack>
            </ActionInputContainer>
          )}
          renderClose={() => (
            <CollapsedField onClick={() => setActiveSection('address')}>
              <HStack gap={12} alignItems="center">
                <Text cropped size={14}>
                  {t('address')}
                </Text>
                <Text cropped size={12} color="shy">
                  {nodeAddress ? (
                    <MiddleTruncate text={nodeAddress ?? ''} width={220} />
                  ) : (
                    t('enter_address')
                  )}
                </Text>
              </HStack>
              <ActionFormIconsWrapper gap={12}>
                {isAddressComplete && !isAddressOpen && (
                  <ActionFormCheckBadge>
                    <CheckmarkIcon />
                  </ActionFormCheckBadge>
                )}
                {!isAddressOpen && (
                  <PencilIconWrapper>
                    <PencilIcon />
                  </PencilIconWrapper>
                )}
              </ActionFormIconsWrapper>
            </CollapsedField>
          )}
        />

        <StackedField
          isOpen={activeSection === 'amount'}
          renderOpen={() => (
            <ActionInputContainer>
              <InputLabel weight="600" size={16}>
                {t('amount')}
              </InputLabel>
              <VStack
                style={{
                  marginBlock: 12,
                }}
              >
                <ActionFieldDivider />
              </VStack>
              <VStack gap={12}>
                <ActionAmountInputSurface>
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field }) => (
                      <BondAmountInput
                        field={field}
                        ticker={coin.ticker}
                        decimals={coin.decimals}
                      />
                    )}
                  />
                </ActionAmountInputSurface>
                {errors.amount && (
                  <ErrorText color="danger" size={13}>
                    {formatError(errors.amount?.message as string)}
                  </ErrorText>
                )}
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  gap={4}
                >
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
                  <PrimaryLabel>{t('balance_available')}:</PrimaryLabel>
                  <SecondaryValue>{formattedBalance}</SecondaryValue>
                </HStack>

                <VStack gap={8}>
                  <TertiaryLabel>
                    {t('operator_fee')}{' '}
                    <Text as="span" size={13} color="shy">
                      ({t('basis_points')})
                    </Text>
                  </TertiaryLabel>
                  <FilledTextInput
                    onWheel={event => event.currentTarget.blur()}
                    validation={errors.operatorFee ? 'warning' : undefined}
                    type="number"
                    step="any"
                    inputMode="decimal"
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
                  <ExpandableHeader
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => setProviderOpen(state => !state)}
                  >
                    <TertiaryLabel>
                      {t('provider')}{' '}
                      <Text as="span" size={13} color="shy">
                        ({t('chainFunctions.optional_validation')})
                      </Text>
                    </TertiaryLabel>
                    <ChevronIcon $isOpen={isProviderOpen}>
                      <ChevronDownIcon />
                    </ChevronIcon>
                  </ExpandableHeader>
                  <AnimatePresence initial={false}>
                    {isProviderOpen && (
                      <motion.div
                        key="provider-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <VStack gap={8}>
                          <FilledTextInput
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </VStack>

                <ActionFieldDivider />

                <HStack justifyContent="space-between" alignItems="center">
                  <TertiaryLabel>{`${t('gas')} (auto)`}</TertiaryLabel>
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
                      <GasAmountText>
                        <KeysignFeeAmount keysignPayload={payload} />
                      </GasAmountText>
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
          )}
          renderClose={() => (
            <CollapsedField onClick={() => setActiveSection('amount')}>
              <HStack gap={12} alignItems="center">
                <Text size={14}>{t('amount')}</Text>
                <Text size={12} color="shy">
                  {parsedAmount
                    ? formatAmount(parsedAmount, { ticker: coin.ticker })
                    : t('enter_amount')}
                </Text>
              </HStack>
              <ActionFormIconsWrapper gap={12}>
                {isAmountComplete && !isAmountOpen && (
                  <ActionFormCheckBadge>
                    <CheckmarkIcon />
                  </ActionFormCheckBadge>
                )}
                {!isAmountOpen && (
                  <PencilIconWrapper>
                    <PencilIcon />
                  </PencilIconWrapper>
                )}
              </ActionFormIconsWrapper>
            </CollapsedField>
          )}
        />
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
    </>
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

const CollapsedField = styled(ActionInputContainer)`
  cursor: pointer;
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })}
`

const PencilIconWrapper = styled.div`
  color: ${getColor('contrast')};
`

const AmountValueRowWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  position: relative;
`

const AmountValueRow = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
`

const LargeAmountInput = styled.input<{ $width: number }>`
  background: transparent;
  border: none;
  box-shadow: none;
  width: ${({ $width }) => `${$width}px`};
  min-width: 120px;
  padding: 0;
  margin: 0;
  font-family: 'Brockmann', sans-serif;
  font-size: 34px;
  font-weight: 500;
  letter-spacing: -1px;
  line-height: 37px;
  color: ${getColor('text')};
  text-align: center;

  &:focus,
  &:hover,
  &:focus-visible {
    outline: none !important;
    border: none !important;
  }

  &:hover,
  &:focus,
  &:active {
    outline: none;
    border: none;
  }

  &::placeholder {
    color: ${getColor('textShy')};
  }
`

const AmountTicker = styled(Text)`
  font-family: 'Brockmann', sans-serif;
  font-size: 34px;
  font-weight: 500;
  letter-spacing: -1px;
  line-height: 37px;
`

const FilledTextInput = styled(TextInput)`
  display: flex;
  padding: 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 12px;
  border: 1px solid #11284a;
  background: #061b3a;
  font-size: 16px;

  &::placeholder {
    color: ${getColor('textShy')};
    font-size: 16px;
  }
`

const brockmannMedium = css`
  font-family: 'Brockmann', sans-serif;
  font-weight: 500;
  letter-spacing: 0.06px;
`

const TertiaryLabel = styled(Text).attrs({ size: 13 })`
  ${brockmannMedium};
  color: ${getColor('textShy')};
  line-height: 18px;
`

const PrimaryLabel = styled(Text).attrs({ size: 13 })`
  ${brockmannMedium};
  color: ${getColor('text')};
  line-height: 18px;
`

const SecondaryValue = styled(Text).attrs({ size: 14 })`
  ${brockmannMedium};
  color: ${getColor('textShyExtra')};
  line-height: 20px;
`

const ChevronIcon = styled.div<{ $isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: rotate(${({ $isOpen }) => ($isOpen ? '180deg' : '0deg')});
  display: flex;
  align-items: center;
`

const ExpandableHeader = styled(HStack)`
  cursor: pointer;
`

const GasAmountText = styled(Text)`
  ${brockmannMedium};
  color: ${getColor('text')};
`

type BondSection = 'address' | 'amount'

type BondAmountInputProps = {
  field: ControllerRenderProps<FormData, 'amount'>
  ticker?: string
  decimals: number
  placeholder?: string
}

const BondAmountInput = ({
  field,
  ticker,
  decimals,
  placeholder = '',
}: BondAmountInputProps) => {
  const maxAmount = 10_000_000
  const displayValue =
    typeof field.value === 'number'
      ? String(field.value)
      : field.value == null
        ? ''
        : String(field.value)

  const measuredWidth = useMemo(() => {
    const textToMeasure =
      displayValue === '' ? placeholder || '0' : displayValue
    const rawWidth = Math.ceil(measureAmountTextWidth(textToMeasure))
    const inputWidth = Math.max(140, rawWidth + 16)
    return { textWidth: rawWidth, inputWidth }
  }, [displayValue, placeholder])

  const centeredTickerLeft =
    (measuredWidth.inputWidth + measuredWidth.textWidth) / 2 + 8

  return (
    <AmountValueRowWrapper>
      <ActionInsideInteractiveElement
        action={
          ticker ? <AmountTicker as="span">{ticker}</AmountTicker> : undefined
        }
        actionPlacerStyles={{
          top: '50%',
          transform: 'translateY(-50%)',
          left: centeredTickerLeft,
        }}
        render={({ actionSize }) => {
          const totalWidth =
            measuredWidth.inputWidth +
            (actionSize?.width ?? 0) +
            (ticker ? 8 : 0)
          return (
            <AmountValueRow style={{ width: totalWidth }}>
              <LargeAmountInput
                $width={measuredWidth.inputWidth}
                value={displayValue}
                onChange={event => {
                  const raw = event.currentTarget.value
                  const normalized = raw.replace(/,/g, '.')
                  if (normalized === '') {
                    field.onChange('')
                    return
                  }
                  if (!/^(\d+\.?\d*|\.\d*)$/.test(normalized)) {
                    return
                  }
                  const numericValue = Number(normalized)
                  if (!Number.isNaN(numericValue) && numericValue > maxAmount) {
                    return
                  }
                  field.onChange(normalized)
                }}
                placeholder={placeholder}
                inputMode="decimal"
                type="text"
                step={stepFromDecimals(decimals)}
              />
            </AmountValueRow>
          )
        }}
      />
    </AmountValueRowWrapper>
  )
}
