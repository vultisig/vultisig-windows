import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { polkadotConfig } from '@core/chain/chains/polkadot/config'
import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { tonConfig } from '@core/chain/chains/ton/config'
import { rippleTxFee } from '@core/chain/tx/fee/ripple'
import { match } from '@lib/utils/match'

import { suiAverageSendGas } from '../chains/sui/config'
import { FeeQuoteForChain } from './core'

export const getFeeAmount = (
  chain: Chain,
  quote: FeeQuoteForChain<Chain>
): bigint =>
  match(getChainKind(chain), {
    utxo: () => {
      const { byteFee, byteFeeMultiplier } = quote as any
      return BigInt(byteFee) * 250n * BigInt(byteFeeMultiplier ?? 1)
    },
    evm: () => {
      const { baseFeePerGas, maxPriorityFeePerGas, gasLimit } = quote as any
      return (
        (BigInt(baseFeePerGas) + BigInt(maxPriorityFeePerGas)) *
        BigInt(gasLimit)
      )
    },
    sui: () => {
      const { gas } = quote as any
      return BigInt(gas) * suiAverageSendGas
    },
    solana: () => {
      const { priorityFee } = quote as any
      const fee = BigInt(priorityFee)
      return fee === 0n ? BigInt(solanaConfig.priorityFeeLimit) : fee
    },
    cosmos: () => {
      const { gas } = quote as any
      return BigInt(gas)
    },
    polkadot: () => polkadotConfig.fee,
    ton: () => tonConfig.fee,
    tron: () => {
      const { gas } = quote as any
      return BigInt(gas)
    },
    ripple: () => BigInt(rippleTxFee),
    cardano: () => {
      const { byteFee, byteFeeMultiplier } = quote as any
      return BigInt(byteFee) * BigInt(byteFeeMultiplier ?? 1)
    },
  })
