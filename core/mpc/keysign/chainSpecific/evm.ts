import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain, EvmChain } from '@core/chain/Chain'
import { evmChainInfo } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { getEvmBaseFee } from '@core/chain/tx/fee/evm/getEvmBaseFee'
import { getEvmGasLimit } from '@core/chain/tx/fee/evm/getEvmGasLimit'
import { getEvmMaxPriorityFee } from '@core/chain/tx/fee/evm/getEvmMaxPriorityFee'
import { defaultFeePriority } from '@core/chain/tx/fee/FeePriority'
import {
  EthereumSpecific,
  EthereumSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { publicActionsL2 } from 'viem/zksync'

import { ChainSpecificResolver } from './ChainSpecificResolver'

const baseFeeMultiplier = 1.5

export const getEthereumSpecific: ChainSpecificResolver<
  EthereumSpecific,
  EvmFeeSettings
> = async ({ coin, feeSettings, amount, receiver }) => {
  const chain = coin.chain as EvmChain

  const nonce = BigInt(
    await getEvmClient(chain).getTransactionCount({
      address: coin.address as `0x${string}`,
    })
  )

  if (chain === Chain.Zksync) {
    const client = getEvmClient(chain).extend(publicActionsL2())
    const value = toChainAmount(shouldBePresent(amount), coin.decimals)

    const { maxFeePerGas, maxPriorityFeePerGas, gasLimit } =
      await client.estimateFee({
        chain: evmChainInfo[chain],
        account: coin.address as `0x${string}`,
        to: shouldBePresent(receiver) as `0x${string}`,
        value,
      })

    return create(EthereumSpecificSchema, {
      maxFeePerGasWei: maxFeePerGas.toString(),
      priorityFee: maxPriorityFeePerGas.toString(),
      gasLimit: gasLimit.toString(),
      nonce,
    })
  }

  const gasLimit =
    feeSettings?.gasLimit ??
    getEvmGasLimit({
      chain,
      isNativeToken: isFeeCoin(coin),
    })

  const baseFee = await getEvmBaseFee(chain)

  const priorityFeeMapValue = await getEvmMaxPriorityFee(chain)

  const feePriority = feeSettings?.priority ?? defaultFeePriority
  const priorityFee = priorityFeeMapValue[feePriority]

  let maxFeePerGasWei = Number(
    BigInt(Math.round(Number(baseFee) * baseFeeMultiplier + priorityFee))
  )

  if (maxFeePerGasWei < 1) maxFeePerGasWei = 1

  return create(EthereumSpecificSchema, {
    maxFeePerGasWei: maxFeePerGasWei.toString(),
    priorityFee: priorityFee.toString(),
    nonce,
    gasLimit: gasLimit.toString(),
  })
}
