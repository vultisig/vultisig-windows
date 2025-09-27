import { EvmChain } from '@core/chain/Chain'
import { isHex } from 'viem'

import { CoinKey } from '../../../coin/Coin'

const zkSyncTransferGasLimit = 200000n
const mantleTransferGasLimit = 90_000_000n

const feeCoinTransferGasLimit: Record<EvmChain, bigint> = {
  [EvmChain.Ethereum]: 23000n,
  [EvmChain.Base]: 40000n,
  [EvmChain.Arbitrum]: 120000n,
  [EvmChain.Polygon]: 23000n,
  [EvmChain.Optimism]: 40000n,
  [EvmChain.CronosChain]: 40000n,
  [EvmChain.Blast]: 40000n,
  [EvmChain.BSC]: 40000n,
  [EvmChain.Avalanche]: 23000n,
  [EvmChain.Zksync]: zkSyncTransferGasLimit,
  [EvmChain.Mantle]: mantleTransferGasLimit,
}

const defaultErc20TransferGasLimit = 120000n

const erc20TransferGasLimit: Record<EvmChain, bigint> = {
  [EvmChain.Ethereum]: defaultErc20TransferGasLimit,
  [EvmChain.Base]: defaultErc20TransferGasLimit,
  [EvmChain.Arbitrum]: defaultErc20TransferGasLimit,
  [EvmChain.Polygon]: defaultErc20TransferGasLimit,
  [EvmChain.Optimism]: defaultErc20TransferGasLimit,
  [EvmChain.CronosChain]: defaultErc20TransferGasLimit,
  [EvmChain.Blast]: defaultErc20TransferGasLimit,
  [EvmChain.BSC]: defaultErc20TransferGasLimit,
  [EvmChain.Avalanche]: defaultErc20TransferGasLimit,
  [EvmChain.Zksync]: zkSyncTransferGasLimit,
  [EvmChain.Mantle]: mantleTransferGasLimit,
}

type DeriveEvmGasLimitInput = {
  coin: CoinKey<EvmChain>
  data?: string
}

// If data is a hex string, we treat it as a contract call; otherwise, it's considered a simple memo
export const deriveEvmGasLimit = ({ coin, data }: DeriveEvmGasLimitInput) => {
  const { id, chain } = coin
  if (data && isHex(data)) {
    return chain === EvmChain.Mantle ? 1_500_000_000n : 600_000n
  }

  return (id ? erc20TransferGasLimit : feeCoinTransferGasLimit)[chain]
}
