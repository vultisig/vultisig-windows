import { createConfig, getQuote } from '@lifi/sdk';

import { CoinKey } from '../../../../coin/Coin';
import { TransferDirection } from '../../../../lib/utils/TransferDirection';
import { OneInchSwapQuote } from '../../oneInch/OneInchSwapQuote';
import { lifiConfig } from '../config';
import {
  lifiSwapChainId,
  LifiSwapEnabledChain,
} from '../LifiSwapEnabledChains';

type Input = Record<TransferDirection, CoinKey<LifiSwapEnabledChain>> & {
  address: string;
  amount: bigint;
};

export const getLifiSwapQuote = async ({
  from,
  to,
  amount,
  address,
}: Input): Promise<OneInchSwapQuote> => {
  createConfig({
    integrator: lifiConfig.integratorName,
  });

  const quote = await getQuote({
    fromChain: lifiSwapChainId[from.chain],
    toChain: lifiSwapChainId[to.chain],
    fromToken: from.id,
    toToken: to.id,
    fromAmount: amount.toString(),
    fromAddress: address,
    fee: lifiConfig.afffiliateFee,
  });

  return quote;
};
