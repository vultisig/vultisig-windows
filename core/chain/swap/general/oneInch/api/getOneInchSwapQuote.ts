import { EvmChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { GeneralSwapQuote } from '@core/chain/swap/general/GeneralSwapQuote'
import { OneInchSwapQuoteResponse } from '@core/chain/swap/general/oneInch/api/OneInchSwapQuoteResponse'
import { oneInchAffiliateConfig } from '@core/chain/swap/general/oneInch/oneInchAffiliateConfig'
import { rootApiUrl } from '@core/config'
import { hexToNumber } from '@lib/utils/hex/hexToNumber'
import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { evmNativeCoinAddress } from '../../../../chains/evm/config'

type Input = {
  account: ChainAccount
  fromCoinId: string
  toCoinId: string
  amount: bigint
  affiliateBps?: number
}

const getBaseUrl = (chainId: number) =>
  `${rootApiUrl}/1inch/swap/v6.0/${chainId}/swap`

export const getOneInchSwapQuote = async ({
  account,
  fromCoinId,
  toCoinId,
  amount,
  affiliateBps,
}: Input): Promise<GeneralSwapQuote> => {
  const chain = account.chain as EvmChain
  const chainId = hexToNumber(getEvmChainId(chain))

  const params = {
    src: isFeeCoin({ id: fromCoinId, chain: account.chain })
      ? evmNativeCoinAddress
      : fromCoinId,
    dst: isFeeCoin({ id: toCoinId, chain: account.chain })
      ? evmNativeCoinAddress
      : toCoinId,
    amount: amount.toString(),
    from: account.address,
    slippage: 0.5,
    disableEstimate: true,
    includeGas: true,
    ...(affiliateBps
      ? {
          referrer: oneInchAffiliateConfig.referrer,
          fee: affiliateBps / 100,
        }
      : {}),
  }

  const url = addQueryParams(getBaseUrl(chainId), params)

  const { dstAmount, tx }: OneInchSwapQuoteResponse =
    await queryUrl<OneInchSwapQuoteResponse>(url)

  return {
    dstAmount,
    provider: '1inch',
    tx: {
      evm: {
        ...tx,
        gasLimit: tx.gas ? BigInt(tx.gas) : undefined,
      },
    },
  }
}
