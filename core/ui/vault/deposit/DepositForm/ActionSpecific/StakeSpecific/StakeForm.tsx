import { ActionAmountInputSurface } from '@core/ui/vault/components/action-form/ActionAmountInputSurface'
import { ActionFieldDivider } from '@core/ui/vault/components/action-form/ActionFieldDivider'
import { ActionInputContainer } from '@core/ui/vault/components/action-form/ActionInputContainer'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { useStakeBalance } from '@core/ui/vault/deposit/staking/useStakeBalance'
import { stepFromDecimals } from '@core/ui/vault/deposit/utils/stepFromDecimals'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { Slider } from '@lib/ui/inputs/Slider'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useEffect, useMemo } from 'react'
import { Controller, ControllerRenderProps, FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { FormData } from '../../types'

type StakeFormProps = {
  balance: number
  errors: FieldErrors<FormData>
  isValid: boolean
  formValues: FormData
  isUnstake?: boolean
}

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

export const StakeForm = ({
  balance,
  errors,
  formValues,
  isUnstake = false,
}: StakeFormProps) => {
  const { t } = useTranslation()
  const [{ control, setValue }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const { stakeId } = useStakeBalance()

  useEffect(() => {
    if (stakeId === 'stcy') {
      setValue('autoCompound', true, { shouldValidate: false })
    } else if (stakeId === 'native-tcy' || stakeId === 'ruji') {
      setValue('autoCompound', false, { shouldValidate: false })
    }
  }, [stakeId, setValue])

  const amountValue = formValues?.amount

  const parsedAmount =
    typeof amountValue === 'number'
      ? amountValue
      : amountValue
        ? Number(amountValue)
        : null

  const currentPercentage = useMemo(() => {
    if (parsedAmount === null || balance === 0) return 0
    return Math.round((parsedAmount / balance) * 100)
  }, [parsedAmount, balance])

  const handleSliderChange = (percentage: number) => {
    const amount = Number(((percentage / 100) * balance).toFixed(coin.decimals))
    setValue('amount', amount, { shouldValidate: true, shouldDirty: true })

    if (isUnstake && stakeId === 'native-tcy') {
      setValue('percentage', percentage, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  const formattedBalance = formatAmount(balance, { ticker: coin.ticker })

  const formatError = (message?: string) =>
    message
      ? t(message, { defaultValue: t('chainFunctions.default_validation') })
      : undefined

  return (
    <VStack gap={16}>
      <ActionInputContainer>
        <InputLabel weight="600" size={16}>
          {t('amount')}
        </InputLabel>
        <ActionFieldDivider />
        <VStack gap={12}>
          <ActionAmountInputSurface>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <StakeAmountInput
                  field={field}
                  ticker={coin.ticker}
                  decimals={coin.decimals}
                  showPercentage
                  percentage={currentPercentage}
                />
              )}
            />
          </ActionAmountInputSurface>
          {errors.amount && (
            <ErrorText color="danger" size={13}>
              {formatError(errors.amount?.message as string)}
            </ErrorText>
          )}

          <Slider
            value={currentPercentage}
            onChange={handleSliderChange}
            min={0}
            max={100}
            showLabels
            showDots
          />

          <HStack justifyContent="space-between" alignItems="center">
            <PrimaryLabel>{t('balance_available')}:</PrimaryLabel>
            <SecondaryValue>{formattedBalance}</SecondaryValue>
          </HStack>
        </VStack>
      </ActionInputContainer>
    </VStack>
  )
}

const brockmannMedium = css`
  font-family: 'Brockmann', sans-serif;
  font-weight: 500;
  letter-spacing: 0.06px;
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

const ErrorText = styled(Text)`
  text-align: center;
`

const AmountValueRowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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

const PercentageDisplay = styled(Text)`
  margin-top: 4px;
`

type StakeAmountInputProps = {
  field: ControllerRenderProps<FormData, 'amount'>
  ticker?: string
  decimals: number
  placeholder?: string
  showPercentage?: boolean
  percentage?: number
}

const StakeAmountInput = ({
  field,
  ticker,
  decimals,
  placeholder = '',
  showPercentage = false,
  percentage = 0,
}: StakeAmountInputProps) => {
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
      {showPercentage && (
        <PercentageDisplay size={15} color="shy">
          {percentage}%
        </PercentageDisplay>
      )}
    </AmountValueRowWrapper>
  )
}
