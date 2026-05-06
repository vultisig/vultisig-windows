import type { Coin } from '@vultisig/core-chain/coin/Coin'

/**
 * Normalized net balance change for one asset (vultisig-sdk main Blockaid EVM parser).
 * Published `@vultisig/core-chain` types may lag this shape in lockfile-only installs.
 */
export type BlockaidEvmBalanceChange = {
  direction: 'send' | 'receive'
  coin: Coin
  amount: bigint
  usdValue?: number
}

/**
 * Runtime output of `parseBlockaidEvmSimulation`: SDK main uses `{ changes }`; older
 * npm-only builds may still surface legacy `{ swap } | { transfer }` until core-chain
 * catches up. CI packs SDK main, so the union must cover both.
 */
export type BlockaidEvmSimulationView =
  | {
      changes: BlockaidEvmBalanceChange[]
    }
  | {
      swap: {
        fromCoin: Coin
        fromAmount: bigint
        toCoin: Coin
        toAmount: bigint
      }
    }
  | {
      transfer: {
        fromCoin: Coin
        fromAmount: bigint
      }
    }
  | null
