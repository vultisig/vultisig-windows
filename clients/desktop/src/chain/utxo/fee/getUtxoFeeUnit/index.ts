import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin';
import { UtxoChain } from '@core/chain/Chain';

export const getUtxoFeeUnit = (chain: UtxoChain): string =>
  `${chainFeeCoin[chain].ticker}/vbyte`;
