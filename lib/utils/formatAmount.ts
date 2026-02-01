const million = 1000000
const billion = 1000000000

type Precision = 'medium' | 'high'

const maximumFractionDigitsRecord: Record<Precision, number> = {
  medium: 3,
  high: 8,
}

const locale = 'en-US'

type FormatAmountOptions =
  | {
      currency: string
    }
  | {
      ticker: string
    }
  | {
      precision: Precision
    }

export const formatAmount = (
  amount: number,
  options: FormatAmountOptions = { precision: 'medium' },
  suffix?: string
): string => {
  if (amount >= billion) {
    return formatAmount(amount / billion, options, 'B')
  }
  if (amount >= million) {
    return formatAmount(amount / million, options, 'M')
  }

  const isCurrency = options && 'currency' in options

  const getPrecision = (): Precision => {
    if ('precision' in options) {
      return options.precision
    }
    return isCurrency ? 'medium' : 'high'
  }

  const formatOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: maximumFractionDigitsRecord[getPrecision()],
  }

  if (isCurrency) {
    formatOptions.currency = options.currency.toUpperCase()
    formatOptions.style = 'currency'
  }

  const formatter = new Intl.NumberFormat(locale, formatOptions)

  const formattedAmount = formatter.format(amount)

  let result = formattedAmount

  if (suffix) {
    result = `${formattedAmount}${suffix}`
  }

  if (options && 'ticker' in options) {
    return `${result} ${options.ticker}`
  }

  return result
}
