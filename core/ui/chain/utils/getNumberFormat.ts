type GetNumberFormatInput = Intl.NumberFormatOptions & {
  locale: string
}

const numberFormats = new Map<string, Intl.NumberFormat>()

/**
 * A shared `Intl.NumberFormat` for this locale and these options, built on
 * first use: amounts are formatted on every render and a formatter is costly
 * to construct.
 */
export const getNumberFormat = ({
  locale,
  ...options
}: GetNumberFormatInput) => {
  const key = `${locale}${JSON.stringify(options)}`
  const cached = numberFormats.get(key)
  if (cached) return cached

  const numberFormat = new Intl.NumberFormat(locale, options)
  numberFormats.set(key, numberFormat)

  return numberFormat
}
