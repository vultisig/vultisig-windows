import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain, EvmChain } from '@core/chain/Chain'
import { cosmosGasLimitRecord } from '@core/chain/chains/cosmos/cosmosGasLimitRecord'
import { polkadotConfig } from '@core/chain/chains/polkadot/config'
import { solanaConfig } from '@core/chain/chains/solana/solanaConfig'
import { tonConfig } from '@core/chain/chains/ton/config'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { rippleTxFee } from '@core/chain/tx/fee/ripple'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'

import { getFeeUnit } from './feeUnit'

type FormatFeeInput = {
  chain: Chain
  chainSpecific: KeysignChainSpecific
}

export const formatFee = ({ chain, chainSpecific }: FormatFeeInput) => {
  const feeAmount = getFeeAmount(chainSpecific)

  const decimals = isOneOf(chain, Object.values(EvmChain))
    ? gwei.decimals
    : chainFeeCoin[chain].decimals

  const amount = fromChainAmount(feeAmount, decimals)

  return formatTokenAmount(amount, getFeeUnit(chain))
}
