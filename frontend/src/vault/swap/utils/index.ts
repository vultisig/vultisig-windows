import { CoinKey } from '../../../coin/Coin';
import { Chain } from '../../../model/chain';

export const convertSeconds = (streaming?: number, swap?: number): string => {
  const seconds = streaming ? streaming + (swap || 0) : swap;
  if (seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (!minutes && !hours) {
      return `${seconds}s`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
  return '~4s';
};

export const parseCoinString = (coinString: string): CoinKey => {
  const [chainId, id] = coinString.split(':');
  if (!chainId || !id) {
    throw new Error('Invalid coin format');
  }
  return { chainId: chainId as Chain, id };
};
