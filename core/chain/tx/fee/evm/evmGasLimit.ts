import { EvmChain } from '@core/chain/Chain'

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
  [EvmChain.Hyperliquid]: 23000n,
  [EvmChain.Sei]: 30_000n,
}

const defaultErc20TransferGasLimit = 120_000n

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
  [EvmChain.Hyperliquid]: defaultErc20TransferGasLimit,
  [EvmChain.Sei]: defaultErc20TransferGasLimit,
}

type DeriveEvmGasLimitInput = {
  coin: CoinKey<EvmChain>
  data?: string
}

export const deriveEvmGasLimit = ({ coin, data }: DeriveEvmGasLimitInput) => {
  const { id, chain } = coin
  if (data) {
    return chain === EvmChain.Mantle ? 3_00_000_0000n : 600_000n
  }

  return (id ? erc20TransferGasLimit : feeCoinTransferGasLimit)[chain]
}
