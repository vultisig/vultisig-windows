import { EvmChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { OneInchSwapQuoteResponse } from '@core/chain/swap/general/oneInch/api/OneInchSwapQuoteResponse'
import { oneInchAffiliateConfig } from '@core/chain/swap/general/oneInch/oneInchAffiliateConfig'
import { defaultEvmSwapGasLimit } from '@core/chain/tx/fee/evm/evmGasLimit'
import { rootApiUrl } from '@core/config'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { pick } from '@lib/utils/record/pick'

import { GeneralSwapQuote } from '../../GeneralSwapQuote'

type Input = {
  account: ChainAccount
  fromCoinId: string
  toCoinId: string
  amount: bigint
  isAffiliate: boolean
}

const getBaseUrl = (chainId: number) =>
  `${rootApiUrl}/1inch/swap/v6.0/${chainId}/swap`

const nativeCoinAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const getOneInchSwapQuote = async ({
  account,
  fromCoinId,
  toCoinId,
  amount,
  isAffiliate,
}: Input): Promise<GeneralSwapQuote> => {
  const chainId = getEvmChainId(account.chain as EvmChain)

  const params = {
    src: isFeeCoin({ id: fromCoinId, chain: account.chain })
      ? nativeCoinAddress
      : fromCoinId,
    dst: isFeeCoin({ id: toCoinId, chain: account.chain })
      ? nativeCoinAddress
      : toCoinId,
    amount: amount.toString(),
    from: account.address,
    slippage: 0.5,
    disableEstimate: true,
    includeGas: true,
    ...(isAffiliate ? pick(oneInchAffiliateConfig, ['referrer', 'fee']) : {}),
  }

  const url = addQueryParams(getBaseUrl(chainId), params)

  const { dstAmount, tx }: OneInchSwapQuoteResponse =
    await queryUrl<OneInchSwapQuoteResponse>(url)

  return {
    dstAmount,
    provider: 'oneinch',
    tx: {
      evm: {
        ...tx,
        gas: tx.gas || defaultEvmSwapGasLimit,
      },
    },
  }
}
