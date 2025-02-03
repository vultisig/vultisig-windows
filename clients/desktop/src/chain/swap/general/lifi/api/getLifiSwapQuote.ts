import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { match } from '@lib/utils/match';
import { memoize } from '@lib/utils/memoize';
import { TransferDirection } from '@lib/utils/TransferDirection';
import { createConfig, getQuote } from '@lifi/sdk';

import { CoinKey } from '../../../../../coin/Coin';
import { DeriveChainKind, getChainKind } from '../../../../../model/chain';
import { defaultEvmSwapGasLimit } from '../../../../evm/evmGasLimit';
import { GeneralSwapQuote } from '../../GeneralSwapQuote';
import { lifiConfig } from '../config';
import {
  lifiSwapChainId,
  LifiSwapEnabledChain,
} from '../LifiSwapEnabledChains';

type Input = Record<TransferDirection, CoinKey<LifiSwapEnabledChain>> & {
  address: string;
  amount: bigint;
};

const setupLifi = memoize(() => {
  createConfig({
    integrator: lifiConfig.integratorName,
  });
});

export const getLifiSwapQuote = async ({
  amount,
  address,
  ...transfer
}: Input): Promise<GeneralSwapQuote> => {
  setupLifi();

  const [fromChain, toChain] = [transfer.from, transfer.to].map(
    ({ chain }) => lifiSwapChainId[chain]
  );

  const [fromToken, toToken] = [transfer.from, transfer.to].map(({ id }) => id);

  const quote = await getQuote({
    fromChain,
    toChain,
    fromToken,
    toToken,
    fromAmount: amount.toString(),
    fromAddress: address,
    fee: lifiConfig.afffiliateFee,
  });

  const { transactionRequest, estimate } = quote;

  const chainKind = getChainKind(transfer.from.chain);

  const { value, gasPrice, gasLimit, data, from, to } =
    shouldBePresent(transactionRequest);

  return {
    dstAmount: estimate.toAmount,
    provider: 'lifi',
    tx: match<DeriveChainKind<LifiSwapEnabledChain>, GeneralSwapQuote['tx']>(
      chainKind,
      {
        solana: () => {
          throw new Error('Solana swaps are not supported yet');
        },
        evm: () => ({
          from: shouldBePresent(from),
          to: shouldBePresent(to),
          data: shouldBePresent(data),
          value: BigInt(shouldBePresent(value)).toString(),
          gasPrice: BigInt(shouldBePresent(gasPrice)).toString(),
          gas: Number(shouldBePresent(gasLimit)) || defaultEvmSwapGasLimit,
        }),
      }
    ),
  };
};
