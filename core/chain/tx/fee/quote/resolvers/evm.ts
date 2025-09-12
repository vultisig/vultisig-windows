import { Chain, EvmChain } from '@core/chain/Chain'
import { evmChainInfo } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getEvmBaseFee } from '@core/chain/tx/fee/evm/baseFee'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
import { getEvmMaxPriorityFeePerGas } from '@core/chain/tx/fee/evm/maxPriorityFeePerGas'
import { bigIntMax } from '@lib/utils/bigint/bigIntMax'
import { publicActionsL2 } from 'viem/zksync'

import { AccountCoinKey } from '../../../../coin/AccountCoin'
import { EvmFeeQuote } from '../core'

export type EvmFeeQuoteInput = {
  coin: AccountCoinKey<EvmChain>
  amount?: number | bigint
  data?: string
  receiver?: string
}

const baseFeeMultiplier = (value: bigint) => (value * 15n) / 10n

export const getEvmFeeQuote = async ({
  coin,
  amount,
  data,
  receiver,
}: EvmFeeQuoteInput): Promise<EvmFeeQuote> => {
  const { chain } = coin

  if (chain === Chain.Zksync) {
    const client = getEvmClient(chain).extend(publicActionsL2())

    return client.estimateFee({
      chain: evmChainInfo[chain],
      account: coin.address as `0x${string}`,
      to: (receiver ?? coin.address) as `0x${string}`,
      value: BigInt(amount ?? 0),
      data: data as `0x${string}` | undefined,
    })
  }

  const gasLimit = getEvmGasLimit(coin)

  const baseFee = await getEvmBaseFee(chain)
  const maxPriorityFeePerGas = await getEvmMaxPriorityFeePerGas(chain)

  const maxFeePerGas = bigIntMax(
    baseFeeMultiplier(baseFee) + maxPriorityFeePerGas,
    1n
  )

  return {
    gasLimit,
    maxPriorityFeePerGas,
    maxFeePerGas,
  }
}
