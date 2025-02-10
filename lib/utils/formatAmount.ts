const million = 1000000;
const billion = 1000000000;

const fiatDecimalPlaces = 2;
const tokenMaxDecimalPlaces = 8;

export const formatAmount = (
  amount: number,
  currency?: string,
  locale = 'en-us'
): string => {
  if (amount > billion) {
    return `${formatAmount(amount / billion, currency, locale)}B`;
  }
  if (amount > million) {
    return `${formatAmount(amount / million, currency, locale)}M`;
  }

  const fractionDigits = fiatDecimalPlaces; 

  // Validate and set locale safely
  let validLocale = 'en-US';
  try {
    validLocale = new Intl.NumberFormat(locale).resolvedOptions().locale;
  } catch (error: unknown) {
    console.warn(
      `Invalid locale provided: ${locale}. Falling back to 'en-US'. ${error}`
    );
  }

  if (currency) {
    try {
      const formatter = new Intl.NumberFormat(validLocale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });

      return formatter.format(amount);
    } catch {
      const formatter = new Intl.NumberFormat(validLocale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });

      return `${formatter.format(amount)} ${currency}`;
    }
  }

  const formatter = new Intl.NumberFormat(validLocale, {
    minimumFractionDigits: fiatDecimalPlaces,
    maximumFractionDigits: tokenMaxDecimalPlaces,
  });

  return formatter.format(amount);
};
