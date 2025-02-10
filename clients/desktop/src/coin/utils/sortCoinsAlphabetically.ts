import { TickerField } from '../Coin';

export const sortCoinsAlphabetically = <T extends TickerField>(
  coins: T[]
): T[] => {
  return coins.sort((a, b) => a.ticker.localeCompare(b.ticker));
};
