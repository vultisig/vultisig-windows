import { ChainKind, getChainKind } from '../../model/chain';
import { CoinBalanceResolver } from './CoinBalanceResolver';
import { getCosmosCoinBalance } from './getCosmosCoinBalance';
import { getEvmCoinBalance } from './getEvmCoinBalance';
import { getRippleCoinBalance } from './getRippleCoinBalance';
import { getSuiCoinBalance } from './getSuiCoinBalance';
import { getTonCoinBalance } from './getTonCoinBalance';
import { getUtxoCoinBalance } from './getUtxoCoinBalance';

const handlers: Record<ChainKind, CoinBalanceResolver<any>> = {
  utxo: getUtxoCoinBalance,
  cosmos: getCosmosCoinBalance,
  sui: getSuiCoinBalance,
  evm: getEvmCoinBalance,
  ton: getTonCoinBalance,
  ripple: getRippleCoinBalance,
};

export const getCoinBalance: CoinBalanceResolver = async input => {
  const chainKind = getChainKind(input.chain);

  const handler = handlers[chainKind];

  return handler(input);
};
