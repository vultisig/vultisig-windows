import { Fiat } from '../../model/fiat';

const million = 1000000;
const billion = 1000000000;

const getFractionDigits = (amount: number): number => {
  const amountStr = amount.toString();
  if (amountStr.startsWith('0') && amount > 0) {
    const nonZeroDigitIndex = amountStr
      .split('')
      .findIndex(digit => digit !== '0' && digit !== '.');

    return nonZeroDigitIndex > 2 ? nonZeroDigitIndex - 1 : nonZeroDigitIndex;
  }

  return 2;
};

export const formatAmount = (
  amount: number,
  currency: Fiat,
  locale: string = 'en-us'
): string => {
  if (amount > billion) {
    return `${formatAmount(amount / billion, currency, locale)}B`;
  }
  if (amount > million) {
    return `${formatAmount(amount / million, currency, locale)}M`;
  }

  const fractionDigits = getFractionDigits(amount);

  const formatter = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  const formattedAmount = formatter.format(amount);

  return `${formattedAmount} ${currency}`;
};
