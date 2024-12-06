const million = 1000000;
const billion = 1000000000;

const defaultFractionDigits = 2;

const getFractionDigits = (amount: number): number => {
  const amountStr = amount.toFixed(20);
  if (amountStr.startsWith('0') && amount > 0) {
    const fractionPartDigits = amountStr.split('.')[1].split('');

    const nonZeroDigitIndex = fractionPartDigits.findIndex(
      digit => digit !== '0'
    );

    if (nonZeroDigitIndex < 0) {
      return defaultFractionDigits;
    }

    const isFollowingZero = fractionPartDigits[nonZeroDigitIndex + 1] === '0';

    return nonZeroDigitIndex + (isFollowingZero ? 1 : 2);
  }

  return defaultFractionDigits;
};

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

  const fractionDigits = getFractionDigits(amount);

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
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatter.format(amount);
};
