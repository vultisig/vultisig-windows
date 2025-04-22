import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { lifiConfig } from '@core/chain/swap/general/lifi/config'
import {
  lifiSwapChainId,
  LifiSwapEnabledChain,
} from '@core/chain/swap/general/lifi/LifiSwapEnabledChains'
import { NoSwapRoutesError } from '@core/chain/swap/NoSwapRoutesError'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { memoize } from '@lib/utils/memoize'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { TransferDirection } from '@lib/utils/TransferDirection'
import { createConfig, getQuote } from '@lifi/sdk'

import { GeneralSwapQuote } from '../../GeneralSwapQuote'

type Input = Record<TransferDirection, CoinKey<LifiSwapEnabledChain>> & {
  address: string
  amount: bigint
}

const setupLifi = memoize(() => {
  createConfig({
    integrator: lifiConfig.integratorName,
  })
})

export const getLifiSwapQuote = async ({
  amount,
  address,
  ...transfer
}: Input): Promise<GeneralSwapQuote> => {
  setupLifi()

  const [fromChain, toChain] = [transfer.from, transfer.to].map(
    ({ chain }) => lifiSwapChainId[chain]
  )

  const [fromToken, toToken] = [transfer.from, transfer.to].map(({ id }) => id)

  try {
    const quote = await getQuote({
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount: amount.toString(),
      fromAddress: address,
      fee: lifiConfig.afffiliateFee,
    })

    const { transactionRequest, estimate } = quote

    const chainKind = getChainKind(transfer.from.chain)

    const { value, gasPrice, gasLimit, data, from, to } =
      shouldBePresent(transactionRequest)

    return {
      dstAmount: estimate.toAmount,
      provider: 'lifi',
      tx: match<DeriveChainKind<LifiSwapEnabledChain>, GeneralSwapQuote['tx']>(
        chainKind,
        {
          solana: () => {
            const { gasCosts, feeCosts } = estimate
            const [networkFee] = shouldBePresent(gasCosts)

            const swapFee = shouldBePresent(
              shouldBePresent(feeCosts).find(
                fee => fee.name === 'LIFI Fixed Fee'
              )
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
          evm: () => ({
            evm: {
              from: shouldBePresent(from),
              to: shouldBePresent(to),
              data: shouldBePresent(data),
              value: BigInt(shouldBePresent(value)).toString(),
              gasPrice: BigInt(shouldBePresent(gasPrice)).toString(),
              gas: Number(shouldBePresent(gasLimit)),
            },
          }),
        }
      ),
    }
  } catch {
    throw new NoSwapRoutesError()
  }
}
