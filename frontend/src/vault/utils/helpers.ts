import { formatMidgardNumber } from '../../utils/midgard';

export const nativeTokenForChain: { [key: string]: string } = {
  AVAX: 'AVAX',
  BCH: 'BCH',
  BNB: 'BNB',
  BSC: 'BNB',
  BTC: 'BTC',
  DASH: 'DASH',
  DOGE: 'DOGE',
  ETH: 'ETH',
  GAIA: 'ATOM',
  KUJI: 'KUJI',
  LTC: 'LTC',
  MAYA: 'CACAO',
  THOR: 'RUNE',
  ARB: 'ETH',
  XRD: 'XRD',
};

export const getOutputAssetAmount = (amount: string, isMaya?: boolean) => {
  return formatMidgardNumber(amount, isMaya).toString();
};
