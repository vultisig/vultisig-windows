import { InputProps } from '@lib/ui/props'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useState } from 'react'

import { getNumberFormat } from '../../../chain/utils/getNumberFormat'
import {
  chainAmountToFiatText,
  fiatTextToChainAmount,
} from './fiatTextToChainAmount'
import {
  getDeviceDecimalSeparator,
  localizeDecimalSeparator,
  normalizeAmountText,
} from './normalizeDecimalSeparator'
import { SendAmountLine } from './SendAmountLine'

type FiatSendAmountInputProps = InputProps<bigint | null> & {
  decimals: number
  price: number
  currency: string
  placeholder: string
  disabled?: boolean
  isWarning?: boolean
}

const minorUnitsLocale = 'en-US'

/** A currency's minor units (2 for USD and EUR, 0 for JPY); the locale does not change them. */
const getCurrencyFractionDigits = (currency: string) =>
  shouldBePresent(
    getNumberFormat({
      locale: minorUnitsLocale,
      style: 'currency',
      currency,
    }).resolvedOptions().maximumFractionDigits,
    'currency fraction digits'
  )

/**
 * Fiat entry for a send amount. The typed fiat text stays as typed while it
 * still converts to the amount being sent; otherwise the field shows the fiat
 * value of that amount at the currency's precision, truncated. Only an edit
 * here changes the amount.
 */
export const FiatSendAmountInput = ({
  value,
  onChange,
  decimals,
  price,
  currency,
  ...lineProps
}: FiatSendAmountInputProps) => {
  const [typedText, setTypedText] = useState('')
  const decimalSeparator = getDeviceDecimalSeparator()

  const typedAmount = fiatTextToChainAmount({
    text: typedText,
    price,
    decimals,
  })

  const text = (() => {
    if (typedText !== '' && typedAmount === value) return typedText
    if (value === null) return ''

    return (
      chainAmountToFiatText({
        amount: value,
        decimals,
        price,
        fractionDigits: getCurrencyFractionDigits(currency),
      }) ?? ''
    )
  })()

  const handleTextChange = (rawText: string) => {
    const nextText = normalizeAmountText({
      text: rawText,
      decimalSeparator,
    })
    if (nextText === undefined) return

    const amount = fiatTextToChainAmount({ text: nextText, price, decimals })
    if (amount === undefined) return

    setTypedText(nextText)
    onChange(amount)
  }

  return (
    <SendAmountLine
      {...lineProps}
      unit={currency}
      text={localizeDecimalSeparator({ text, decimalSeparator })}
      onTextChange={handleTextChange}
    />
  )
}
