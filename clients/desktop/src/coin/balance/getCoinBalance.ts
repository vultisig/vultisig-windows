import { ChainKind, getChainKind } from '../../model/chain';
import { GetCoinBalanceInput } from './GetCoinBalanceInput';
import { getCosmosCoinBalance } from './getCosmosCoinBalance';
import { getEvmCoinBalance } from './getEvmCoinBalance';
import { getSuiCoinBalance } from './getSuiCoinBalance';
import { getUtxoCoinBalance } from './getUtxoCoinBalance';

const handlers: Record<
  ChainKind,
  (input: GetCoinBalanceInput<any>) => Promise<bigint>
> = {
  utxo: getUtxoCoinBalance,
  cosmos: getCosmosCoinBalance,
  sui: getSuiCoinBalance,
  evm: getEvmCoinBalance,
};

export const getCoinBalance = async (
  input: GetCoinBalanceInput
): Promise<bigint> => {
  const chainKind = getChainKind(input.chain);

  const handler = handlers[chainKind];

  return handler(input);
};
