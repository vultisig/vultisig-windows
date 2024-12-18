import { addQueryParams } from '../../../../lib/utils/query/addQueryParams';
import { queryUrl } from '../../../../lib/utils/query/queryUrl';
import { pick } from '../../../../lib/utils/record/pick';
import { EvmChain, evmChainIds } from '../../../../model/chain';
import { Endpoint } from '../../../../services/Endpoint';
import { ChainAccount } from '../../../ChainAccount';
import { isNativeCoin } from '../../../utils/isNativeCoin';
import { oneInchAffiliateConfig } from '../oneInchAffiliateConfig';
import { OneInchSwapQuote } from '../OneInchSwapQuote';

type Input = {
  account: ChainAccount;
  fromCoinId: string;
  toCoinId: string;
  amount: bigint;
  isAffiliate: boolean;
};

const baseUrl = `${Endpoint.vultisigApiProxy}/1inch/swap/v6.0/`;

const nativeCoinAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const getOneInchSwapQuote = async ({
  account,
  fromCoinId,
  toCoinId,
  amount,
  isAffiliate,
}: Input) => {
  const chainId = evmChainIds[account.chain as EvmChain];

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

  const url = addQueryParams(`${baseUrl}quote/${chainId}/swap`, params);

  const result = await queryUrl<OneInchSwapQuote>(url);

  console.log('oneInchQuote: ', result);

  return result;
};
