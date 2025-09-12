import { EvmChain } from '../../../../Chain'
import { evmChainInfo } from '../../../../chains/evm/chainInfo'
import { getEvmClient } from '../../../../chains/evm/client'
import { getEvmBaseFee } from '../../evm/baseFee'
import { getEvmGasLimit } from '../../evm/getEvmGasLimit'
import { getEvmMaxPriorityFeePerGas } from '../../evm/maxPriorityFeePerGas'
import { FeeQuote } from '../core'
import { FeeQuoteInput, FeeQuoteResolver } from '../resolver'
import { toChainAmount } from '../../../../amount/toChainAmount'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { publicActionsL2 } from 'viem/zksync'

export const getEvmFeeQuote: FeeQuoteResolver<EvmChain> = async (
  input: FeeQuoteInput<EvmChain>
): Promise<FeeQuote<'evm'>> => {
  const chain = input.coin.chain as EvmChain
  if (chain === 'Zksync') {
    const client = getEvmClient(chain).extend(publicActionsL2())
    const value = toChainAmount(
      shouldBePresent(input.amount),
      input.coin.decimals
    )
    const { maxFeePerGas, maxPriorityFeePerGas, gasLimit } =
      await client.estimateFee({
        chain: evmChainInfo[chain],
        account: input.coin.address as `0x${string}`,
        to: shouldBePresent(input.receiver) as `0x${string}`,
        value,
        data: input.data,
      })
    const baseFee = maxFeePerGas - maxPriorityFeePerGas
    return {
      gasLimit: BigInt(gasLimit),
      maxPriorityFeePerGas: BigInt(maxPriorityFeePerGas),
      baseFee: BigInt(baseFee),
    }
  }

  const gasLimit = getEvmGasLimit(input.coin as any)
  const baseFee = await getEvmBaseFee(chain)
  const priorityFee = await getEvmMaxPriorityFeePerGas(chain)
  return {
    gasLimit,
    maxPriorityFeePerGas: priorityFee,
    baseFee,
  }
}
