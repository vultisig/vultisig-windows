const million = 1000000
const billion = 1000000000

const currencyMaxDecimalPlaces = 3
const tickerMaxDecimalPlaces = 8

const locale = 'en-US'

type FormatAmountOptions =
  | {
      currency: string
    }
  | {
      ticker: string
    }

export const formatAmount = (
  amount: number,
  options?: FormatAmountOptions
): string => {
  if (amount > billion) {
    return `${formatAmount(amount / billion, options)}B`
  }
  if (amount > million) {
    return `${formatAmount(amount / million, options)}M`
  }

  const isCurrency = options && 'currency' in options

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: isCurrency ? options.currency.toUpperCase() : undefined,
    maximumFractionDigits: isCurrency
      ? currencyMaxDecimalPlaces
      : tickerMaxDecimalPlaces,
  })

  const formattedAmount = formatter.format(amount)

  if (options && 'ticker' in options) {
    return `${formattedAmount} ${options.ticker}`
  }
  return formattedAmount
}
