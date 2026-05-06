import type { Coin } from '@vultisig/core-chain/coin/Coin'
import type { BlockaidEvmSimulationInfo as CoreBlockaidEvmSimulationInfo } from '@vultisig/core-chain/security/blockaid/tx/simulation/core'

export type BlockaidEvmBalanceChange = {
  coin: Coin
  direction: 'send' | 'receive'
  amount: bigint
  usdValue?: number
}

export type BlockaidEvmChangesSimulationInfo = {
  changes: BlockaidEvmBalanceChange[]
}

export type BlockaidEvmSimulationInfo =
  | CoreBlockaidEvmSimulationInfo
  | BlockaidEvmChangesSimulationInfo
