import { Fetch } from '../../../../../../wailsjs/go/utils/GoHttp';
import { addQueryParams } from '../../../../../lib/utils/query/addQueryParams';
import { pick } from '../../../../../lib/utils/record/pick';
import { EvmChain } from '../../../../../model/chain';
import { Endpoint } from '../../../../../services/Endpoint';
import { ChainAccount } from '../../../../ChainAccount';
import { getEvmChainId } from '../../../../evm/chainInfo';
import { defaultEvmSwapGasLimit } from '../../../../evm/evmGasLimit';
import { isNativeCoin } from '../../../../utils/isNativeCoin';
import { GeneralSwapQuote } from '../../GeneralSwapQuote';
import { oneInchAffiliateConfig } from '../oneInchAffiliateConfig';
import { OneInchSwapQuoteResponse } from './OneInchSwapQuoteResponse';

type Input = {
  account: ChainAccount;
  fromCoinId: string;
  toCoinId: string;
  amount: bigint;
  isAffiliate: boolean;
};

const getBaseUrl = (chainId: number) =>
  `${Endpoint.vultisigApiProxy}/1inch/swap/v6.0/${chainId}/swap`;

const nativeCoinAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const getOneInchSwapQuote = async ({
  account,
  fromCoinId,
  toCoinId,
  amount,
  isAffiliate,
}: Input): Promise<GeneralSwapQuote> => {
  const chainId = getEvmChainId(account.chain as EvmChain);

  const params = {
    src: isNativeCoin({ id: fromCoinId, chain: account.chain })
      ? nativeCoinAddress
      : fromCoinId,
    dst: isNativeCoin({ id: toCoinId, chain: account.chain })
      ? nativeCoinAddress
      : toCoinId,
    amount: amount.toString(),
    from: account.address,
    slippage: 0.5,
    disableEstimate: true,
    includeGas: true,
    ...(isAffiliate ? pick(oneInchAffiliateConfig, ['referrer', 'fee']) : {}),
  };

  const url = addQueryParams(getBaseUrl(chainId), params);

  const { dstAmount, tx }: OneInchSwapQuoteResponse = await Fetch(url);

  return {
    dstAmount,
    provider: 'oneinch',
    tx: {
      ...tx,
      gas: tx.gas || defaultEvmSwapGasLimit,
    },
  };
};
