import type { CoinKey } from '@vultisig/core-chain/coin/Coin'

import { withoutKaminoShareCoins } from './solana/isKaminoShareCoin'
import { withoutBondedRuneReceiptCoins } from './thorchain/isBondedRuneReceiptCoin'
import { withoutRujiStakingReceiptCoins } from './thorchain/isRujiStakingReceiptCoin'
import { withoutThorchainLpCoins } from './thorchain/isThorchainLpCoin'

type DefiOnlyCoinInput = CoinKey & { ticker?: string }

/**
 * Drops coin rows that are DeFi positions rather than wallet tokens: the
 * THORChain staking receipts sRUJI and ybRUNE, Rujira LP tokens (`LP-…`), and
 * Kamino Earn share mints. Every wallet-only fiat total goes through this one
 * filter, so the home header and the vault list always sum the same coins.
 */
export const withoutDefiOnlyCoins = <T extends DefiOnlyCoinInput>(
  coins: readonly T[]
): T[] =>
  withoutKaminoShareCoins(
    withoutThorchainLpCoins(
      withoutBondedRuneReceiptCoins(withoutRujiStakingReceiptCoins(coins))
    )
  )
