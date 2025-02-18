import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain, EvmChain } from '@core/chain/Chain'
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { rippleTxFee } from '@core/chain/tx/fee/ripple'
import { KeysignChainSpecific } from '@core/keysign/chainSpecific/KeysignChainSpecific'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { formatAmount } from '@lib/utils/formatAmount'
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
      solanaSpecific: ({ priorityFee }) => BigInt(priorityFee),
      thorchainSpecific: ({ fee }) => BigInt(fee),
      mayaSpecific: () => BigInt(cosmosGasLimitRecord[Chain.MayaChain]),
      cosmosSpecific: ({ gas }) => BigInt(gas),
      polkadotSpecific: () => polkadotConfig.fee,
      tonSpecific: () => tonConfig.fee,
      rippleSpecific: () => rippleTxFee,
      tronSpecific: () => {
        throw new Error('Tron fee not implemented')
      },
    }
  )

  const decimals = isOneOf(chain, Object.values(EvmChain))
    ? gwei.decimals
    : chainFeeCoin[chain].decimals

  const amount = fromChainAmount(feeAmount, decimals)

  return formatAmount(amount, getFeeUnit(chain))
}
