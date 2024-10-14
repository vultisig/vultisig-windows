const million = 1000000;
const billion = 1000000000;

const defaultFractionDigits = 2;

const getFractionDigits = (amount: number): number => {
  const amountStr = amount.toString();
  if (amountStr.startsWith('0') && amount > 0) {
    const fractionPartDigits = amountStr.split('.')[1].split('');

    const nonZeroDigitIndex = fractionPartDigits.findIndex(
      digit => digit !== '0'
    );

    if (nonZeroDigitIndex < 0) {
      return defaultFractionDigits;
    }

    const isFollowingZero = fractionPartDigits[nonZeroDigitIndex + 1] === '0';

    return nonZeroDigitIndex + (isFollowingZero ? 0 : 1);
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

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  const formattedAmount = formatter.format(amount);

  return currency ? `${formattedAmount} ${currency}` : formattedAmount;
};
