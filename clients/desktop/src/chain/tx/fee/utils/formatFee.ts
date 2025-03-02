import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain, EvmChain } from '@core/chain/Chain'
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { rippleTxFee } from '@core/chain/tx/fee/ripple'
import { KeysignChainSpecific } from '@core/keysign/chainSpecific/KeysignChainSpecific'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'

import { polkadotConfig } from '../../../polkadot/config'
import { tonConfig } from '../../../ton/config'
import { gwei } from './evm'
import { getFeeUnit } from './feeUnit'

type FormatFeeInput = {
  chain: Chain
  chainSpecific: KeysignChainSpecific
}

export const formatFee = ({ chain, chainSpecific }: FormatFeeInput) => {
  const feeAmount: bigint = matchDiscriminatedUnion(
    chainSpecific,
    'case',
    'value',
    {
      utxoSpecific: ({ byteFee }) => BigInt(byteFee),
      ethereumSpecific: ({ maxFeePerGasWei }) => BigInt(maxFeePerGasWei),
      suicheSpecific: ({ referenceGasPrice }) => BigInt(referenceGasPrice),
      solanaSpecific: ({ priorityFee }) =>
        BigInt(priorityFee) == BigInt(0)
          ? BigInt(solanaConfig.priorityFeeLimit)
          : BigInt(priorityFee), // currently we hardcode the priority fee to 100_000 lamports
      thorchainSpecific: ({ fee }) => BigInt(fee),
      mayaSpecific: () => BigInt(cosmosGasLimitRecord[Chain.MayaChain]),
      cosmosSpecific: ({ gas }) => BigInt(gas),
      polkadotSpecific: () => polkadotConfig.fee,
      tonSpecific: () => tonConfig.fee,
      rippleSpecific: () => rippleTxFee,
      tronSpecific: ({ gasEstimation }) => BigInt(gasEstimation || 0),
    }
  )

  const decimals = isOneOf(chain, Object.values(EvmChain))
    ? gwei.decimals
    : chainFeeCoin[chain].decimals

  const amount = fromChainAmount(feeAmount, decimals)

  return formatTokenAmount(amount, getFeeUnit(chain))
}
