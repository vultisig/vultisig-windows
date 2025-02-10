import { chainFeeCoin } from '../../../../coin/chainFeeCoins';
import { UtxoChain } from '@core/chain/Chain';

export const getUtxoFeeUnit = (chain: UtxoChain): string =>
  `${chainFeeCoin[chain].ticker}/vbyte`;
