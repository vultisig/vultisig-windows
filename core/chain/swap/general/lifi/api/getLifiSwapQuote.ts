import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { lifiConfig } from '@core/chain/swap/general/lifi/config'
import {
  lifiSwapChainId,
  LifiSwapEnabledChain,
} from '@core/chain/swap/general/lifi/LifiSwapEnabledChains'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { memoize } from '@lib/utils/memoize'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { TransferDirection } from '@lib/utils/TransferDirection'
import { createConfig, getQuote } from '@lifi/sdk'

import { AccountCoinKey } from '../../../../coin/AccountCoin'
import { GeneralSwapQuote } from '../../GeneralSwapQuote'

type Input = Record<TransferDirection, AccountCoinKey<LifiSwapEnabledChain>> & {
  amount: bigint
  affiliateBps?: number
}

const setupLifi = memoize(() => {
  createConfig({
    integrator: lifiConfig.integratorName,
  })
})

export const getLifiSwapQuote = async ({
  amount,
  affiliateBps,
  ...transfer
}: Input): Promise<GeneralSwapQuote> => {
  setupLifi()

  const [fromChain, toChain] = [transfer.from, transfer.to].map(
    ({ chain }) => lifiSwapChainId[chain]
  )

  const [fromToken, toToken] = [transfer.from, transfer.to].map(
    ({ id, chain }) => id ?? chainFeeCoin[chain].ticker
  )
  const [fromAddress, toAddress] = [transfer.from, transfer.to].map(
    ({ address }) => address
  )

  const quote = await getQuote({
    fromChain,
    toChain,
    fromToken,
    toToken,
    fromAmount: amount.toString(),
    fromAddress,
    toAddress,
    fee: affiliateBps ? affiliateBps / 10000 : undefined,
  })

  const { transactionRequest, estimate } = quote

  const chainKind = getChainKind(transfer.from.chain)

  const { value, gasLimit, data, from, to } =
    shouldBePresent(transactionRequest)

  return {
    dstAmount: estimate.toAmount,
    provider: 'li.fi',
    tx: match<DeriveChainKind<LifiSwapEnabledChain>, GeneralSwapQuote['tx']>(
      chainKind,
      {
        solana: () => {
          const { gasCosts, feeCosts } = estimate
          const [networkFee] = shouldBePresent(gasCosts)

          const fees = shouldBePresent(feeCosts)

          const swapFee = shouldBePresent(
            fees.find(fee => fee.name === 'LIFI Fixed Fee') || fees[0]
          )

          const swapFeeAssetId =
            [fromToken, toToken].find(
              token => token === swapFee.token.address
            ) || chainFeeCoin[transfer.from.chain].id

          return {
            solana: {
              data: shouldBePresent(data),
              networkFee: BigInt(networkFee.amount),
              swapFee: {
                amount: BigInt(swapFee.amount),
                decimals: swapFee.token.decimals,
                chain: mirrorRecord(lifiSwapChainId)[swapFee.token.chainId],
                id: swapFeeAssetId,
              },
            },
          }
        },
        evm: () => {
          return {
            evm: {
              from: shouldBePresent(from),
              to: shouldBePresent(to),
              data: shouldBePresent(data),
              value: BigInt(shouldBePresent(value)).toString(),
              gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
            },
          }
        },
      }
    ),
  }
}
